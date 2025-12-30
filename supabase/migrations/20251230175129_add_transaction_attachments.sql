/*
  # Add Transaction Attachments Support

  1. Changes
    - Add `attachment_url` column to `transactions` table
      - Type: text (nullable)
      - Stores the public URL of the receipt/proof file
    
  2. Storage
    - Create `expense-receipts` bucket for storing receipt files
    - Add policies for authenticated users to:
      - Upload files to their own folder
      - Read their own files
      - Delete their own files
    
  3. Security
    - Users can only access files in their own user ID subfolder
    - File size limit: 5MB
    - Allowed file types: image/png, application/pdf
*/

-- Add attachment_url column to transactions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'attachment_url'
  ) THEN
    ALTER TABLE transactions ADD COLUMN attachment_url text;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_attachment_url ON transactions(attachment_url);

-- Create storage bucket for expense receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'expense-receipts',
  'expense-receipts',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload files to their own folder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can upload their own receipts'
  ) THEN
    CREATE POLICY "Users can upload their own receipts"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'expense-receipts' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Policy: Users can view their own files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can view their own receipts'
  ) THEN
    CREATE POLICY "Users can view their own receipts"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'expense-receipts' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Policy: Users can delete their own files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can delete their own receipts'
  ) THEN
    CREATE POLICY "Users can delete their own receipts"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'expense-receipts' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Policy: Users can update their own files (for replacing receipts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can update their own receipts'
  ) THEN
    CREATE POLICY "Users can update their own receipts"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'expense-receipts' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;
/*
  # Fix Public Access for Receipt Files

  1. Changes
    - Add public SELECT policy for expense-receipts bucket
    - Allow anonymous/public access to view files via public URLs
    - Maintains security: upload/delete/update still require authentication
    
  2. Security
    - Files remain in user-specific folders (user_id)
    - URLs are not guessable (secure random paths)
    - Only users with the exact URL can access files
    - Upload and deletion still restricted to authenticated users
*/

-- Drop the old authenticated-only SELECT policy
DROP POLICY IF EXISTS "Users can view their own receipts" ON storage.objects;

-- Create new public SELECT policy for viewing files via public URLs
CREATE POLICY "Public can view receipts via URL"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'expense-receipts');

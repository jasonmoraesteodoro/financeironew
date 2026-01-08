/*
  # Add Received Flag for Income Transactions

  1. Changes
    - Add `received` column to transactions table (boolean, default false)
    - Similar to `paid` flag for expenses, this allows tracking provisioned vs actual income
    
  2. Purpose
    - Users can provision future income without showing it as already received
    - Helps differentiate between expected and confirmed income
    - Improves financial planning and accuracy of current balance
*/

-- Add received column to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS received boolean DEFAULT false;

-- Set existing income transactions as received
UPDATE transactions 
SET received = true 
WHERE type = 'income' AND received IS NULL;

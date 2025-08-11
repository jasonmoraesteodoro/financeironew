/*
  # Adicionar funcionalidade de Investimentos

  1. Alterações no Esquema
    - Estender o tipo `transaction_type` para incluir 'investment'
    - Adicionar coluna `bank_account_id` na tabela `transactions`
    - Criar índice para melhor performance

  2. Segurança
    - Manter as políticas RLS existentes (já cobrem o novo tipo)
    - Garantir isolamento por usuário

  3. Compatibilidade
    - Alterações são aditivas, não quebram funcionalidade existente
    - Coluna `bank_account_id` é opcional (nullable)
*/

-- Estender o tipo transaction_type para incluir 'investment'
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'investment';

-- Adicionar coluna bank_account_id à tabela transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'bank_account_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN bank_account_id uuid REFERENCES bank_accounts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Criar índice para melhor performance na nova coluna
CREATE INDEX IF NOT EXISTS transactions_bank_account_id_idx ON transactions(bank_account_id);

-- As políticas RLS existentes já cobrem a nova funcionalidade
-- pois filtram por user_id, que é mantido em todas as transações
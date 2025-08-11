/*
  # Criação das tabelas principais do My Finance

  1. Novas Tabelas
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (enum: income/expense)
      - `color` (text)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `subcategories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `parent_id` (uuid, foreign key to categories)
      - `type` (enum: income/expense)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `type` (enum: income/expense)
      - `amount` (decimal)
      - `category_id` (uuid, foreign key)
      - `subcategory_id` (uuid, foreign key, nullable)
      - `date` (date)
      - `paid` (boolean, default false)
      - `observation` (text, nullable)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas para usuários autenticados acessarem apenas seus próprios dados
    - Índices para melhor performance
*/

-- Criar enum para tipos
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type transaction_type NOT NULL,
  color text NOT NULL DEFAULT '#6B7280',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de subcategorias
CREATE TABLE IF NOT EXISTS subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  type transaction_type NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type transaction_type NOT NULL,
  amount decimal(10,2) NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  subcategory_id uuid REFERENCES subcategories(id) ON DELETE SET NULL,
  date date NOT NULL,
  paid boolean DEFAULT false,
  observation text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas para categories
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para subcategories
CREATE POLICY "Users can view own subcategories"
  ON subcategories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subcategories"
  ON subcategories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subcategories"
  ON subcategories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subcategories"
  ON subcategories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON categories(user_id);
CREATE INDEX IF NOT EXISTS categories_type_idx ON categories(type);
CREATE INDEX IF NOT EXISTS subcategories_user_id_idx ON subcategories(user_id);
CREATE INDEX IF NOT EXISTS subcategories_parent_id_idx ON subcategories(parent_id);
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_category_id_idx ON transactions(category_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON transactions(type);
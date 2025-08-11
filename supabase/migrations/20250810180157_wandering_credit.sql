/*
  # Configuração Completa do My Finance

  1. Tipos e Tabelas
    - Tipo enum `transaction_type`
    - Tabela `categories` para categorias de receitas/despesas
    - Tabela `subcategories` para subcategorias
    - Tabela `transactions` para transações financeiras

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para isolamento por usuário
    - Função para criar categorias padrão

  3. Automação
    - Trigger para criar categorias padrão em novos usuários
*/

-- Criar tipo enum para transações
DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('income', 'expense');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type transaction_type NOT NULL,
  color text NOT NULL DEFAULT '#6B7280',
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON categories(user_id);
CREATE INDEX IF NOT EXISTS categories_type_idx ON categories(type);

-- Habilitar RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categories
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own categories" ON categories;
CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Criar tabela de subcategorias
CREATE TABLE IF NOT EXISTS subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS subcategories_user_id_idx ON subcategories(user_id);
CREATE INDEX IF NOT EXISTS subcategories_parent_id_idx ON subcategories(parent_id);

-- Habilitar RLS
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para subcategories
DROP POLICY IF EXISTS "Users can view own subcategories" ON subcategories;
CREATE POLICY "Users can view own subcategories"
  ON subcategories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subcategories" ON subcategories;
CREATE POLICY "Users can insert own subcategories"
  ON subcategories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subcategories" ON subcategories;
CREATE POLICY "Users can update own subcategories"
  ON subcategories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own subcategories" ON subcategories;
CREATE POLICY "Users can delete own subcategories"
  ON subcategories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Criar tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type transaction_type NOT NULL,
  amount numeric(10,2) NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  subcategory_id uuid REFERENCES subcategories(id) ON DELETE SET NULL,
  date date NOT NULL,
  paid boolean DEFAULT false,
  observation text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_category_id_idx ON transactions(category_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON transactions(type);

-- Habilitar RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Função para criar categorias padrão
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir categorias de receita
  INSERT INTO public.categories (name, type, color, user_id) VALUES
    ('Salário', 'income', '#10B981', NEW.id),
    ('Freelance', 'income', '#059669', NEW.id),
    ('Investimentos', 'income', '#047857', NEW.id),
    ('Outros', 'income', '#065F46', NEW.id);

  -- Inserir categorias de despesa
  INSERT INTO public.categories (name, type, color, user_id) VALUES
    ('Alimentação', 'expense', '#EF4444', NEW.id),
    ('Transporte', 'expense', '#DC2626', NEW.id),
    ('Moradia', 'expense', '#B91C1C', NEW.id),
    ('Saúde', 'expense', '#991B1B', NEW.id),
    ('Educação', 'expense', '#7F1D1D', NEW.id),
    ('Lazer', 'expense', '#F97316', NEW.id),
    ('Compras', 'expense', '#EA580C', NEW.id),
    ('Outros', 'expense', '#9A3412', NEW.id);

  RETURN NEW;
END;
$$;

-- Criar trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_categories();
/*
  # Inserir categorias padrão para novos usuários

  1. Função para criar categorias padrão
    - Será executada quando um novo usuário se registrar
    - Cria categorias básicas de receita e despesa

  2. Trigger
    - Executa automaticamente após inserção na tabela auth.users
*/

-- Função para criar categorias padrão
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Categorias de receita padrão
  INSERT INTO categories (name, type, color, user_id) VALUES
    ('Salário', 'income', '#10B981', NEW.id),
    ('Vendas', 'income', '#3B82F6', NEW.id),
    ('Investimentos', 'income', '#8B5CF6', NEW.id),
    ('Outros', 'income', '#6B7280', NEW.id);
  
  -- Categorias de despesa padrão
  INSERT INTO categories (name, type, color, user_id) VALUES
    ('Alimentação', 'expense', '#EF4444', NEW.id),
    ('Moradia', 'expense', '#F59E0B', NEW.id),
    ('Transporte', 'expense', '#EC4899', NEW.id),
    ('Lazer', 'expense', '#14B8A6', NEW.id),
    ('Saúde', 'expense', '#6366F1', NEW.id),
    ('Outros', 'expense', '#6B7280', NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função quando um usuário se registrar
DROP TRIGGER IF EXISTS create_default_categories_trigger ON auth.users;
CREATE TRIGGER create_default_categories_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();
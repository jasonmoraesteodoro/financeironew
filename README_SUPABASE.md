# 🚀 Configuração do Supabase para My Finance

## 📋 Passos para Configurar o Banco de Dados

### 1. Acesse o Supabase Dashboard
- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta
- Selecione seu projeto ou crie um novo

### 2. Execute o Script SQL
1. No dashboard do Supabase, clique em **"SQL Editor"** no menu lateral
2. Clique em **"New Query"**
3. Copie todo o conteúdo do arquivo `supabase/migrations/create_all_tables.sql`
4. Cole no editor SQL
5. Clique em **"Run"** para executar o script

### 3. Verifique as Tabelas Criadas
Após executar o script, você deve ver:
- ✅ **3 tabelas** criadas: `categories`, `subcategories`, `transactions`
- ✅ **1 tipo enum** criado: `transaction_type`
- ✅ **1 função** criada: `create_default_categories`
- ✅ **1 trigger** criado: `on_auth_user_created`

### 4. Configure as Variáveis de Ambiente
No seu projeto, configure as variáveis:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 🔐 Segurança Implementada

### Row Level Security (RLS)
- ✅ **Habilitado** em todas as tabelas
- ✅ **Políticas** para cada operação (SELECT, INSERT, UPDATE, DELETE)
- ✅ **Isolamento** por usuário - cada usuário só vê seus próprios dados

### Políticas de Acesso
- **Categories**: Usuários só podem gerenciar suas próprias categorias
- **Subcategories**: Usuários só podem gerenciar suas próprias subcategorias
- **Transactions**: Usuários só podem gerenciar suas próprias transações

## 🎯 Funcionalidades Automáticas

### Categorias Padrão
Quando um novo usuário se registra, são criadas automaticamente:

**Receitas:**
- Salário
- Freelance
- Investimentos
- Outros

**Despesas:**
- Alimentação
- Transporte
- Moradia
- Saúde
- Educação
- Lazer
- Compras
- Outros

## 📊 Estrutura das Tabelas

### Categories
```sql
- id (uuid, PK)
- name (text)
- type (transaction_type: 'income' | 'expense')
- color (text)
- user_id (uuid, FK)
- created_at (timestamptz)
```

### Subcategories
```sql
- id (uuid, PK)
- name (text)
- parent_id (uuid, FK -> categories.id)
- type (transaction_type)
- user_id (uuid, FK)
- created_at (timestamptz)
```

### Transactions
```sql
- id (uuid, PK)
- type (transaction_type)
- amount (numeric(10,2))
- category_id (uuid, FK)
- subcategory_id (uuid, FK, nullable)
- date (date)
- paid (boolean)
- observation (text, nullable)
- user_id (uuid, FK)
- created_at (timestamptz)
```

## ✅ Verificação Final

Após executar o script, teste:
1. **Registre um novo usuário** no app
2. **Verifique** se as categorias padrão foram criadas
3. **Crie uma transação** para testar o funcionamento
4. **Teste** todas as operações CRUD

**Pronto! Seu banco de dados está configurado e funcionando! 🎉**
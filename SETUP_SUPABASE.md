# Guia de Configuração do Supabase

Este guia irá te ajudar a conectar este sistema ao seu projeto Supabase existente ou criar um novo.

## Opção 1: Usar Projeto Supabase Existente

Se você já tem um projeto no Supabase e deseja usar este sistema:

### Passo 1: Executar o Schema SQL

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto existente
3. No menu lateral, clique em **SQL Editor**
4. Clique em **+ New query**
5. Abra o arquivo `supabase-schema.sql` deste projeto
6. Copie todo o conteúdo e cole no SQL Editor
7. Clique no botão **Run** ou pressione `Ctrl+Enter`

**Importante**: O schema criará:
- 8 tabelas novas (users, bank_accounts, categories, transactions, budgets, goals, investments, goal_contributions)
- Políticas de segurança (Row Level Security)
- Triggers para automatizar criação de categorias padrão
- Função para criar categorias iniciais

### Passo 2: Configurar Variáveis de Ambiente

1. No painel do Supabase, vá em **Settings** → **API**
2. Copie as seguintes credenciais:
   - **Project URL**: Algo como `https://xxxxx.supabase.co`
   - **anon/public key**: Uma chave longa começando com `eyJ...`

3. Crie um arquivo `.env` na raiz do projeto:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` e cole suas credenciais:
```env
VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### Passo 3: Verificar Autenticação

1. No painel do Supabase, vá em **Authentication** → **Providers**
2. Certifique-se que **Email** está habilitado
3. (Opcional) Configure outros provedores como Google, GitHub, etc.

### Passo 4: Testar a Conexão

Execute o projeto:
```bash
npm install
npm run dev
```

Acesse `http://localhost:5173` e tente criar uma conta.

---

## Opção 2: Criar Novo Projeto Supabase

Se você ainda não tem um projeto no Supabase:

### Passo 1: Criar Conta e Projeto

1. Acesse https://supabase.com
2. Clique em **Start your project**
3. Crie uma conta (pode usar GitHub para login rápido)
4. Clique em **New Project**
5. Preencha:
   - **Name**: Fin (ou qualquer nome)
   - **Database Password**: Anote esta senha (você vai precisar!)
   - **Region**: Escolha o mais próximo (ex: South America - São Paulo)
   - **Pricing Plan**: Free (gratuito)
6. Clique em **Create new project**
7. Aguarde 1-2 minutos enquanto o projeto é criado

### Passo 2: Executar o Schema SQL

1. Quando o projeto estiver pronto, vá em **SQL Editor** no menu lateral
2. Clique em **+ New query**
3. Abra o arquivo `supabase-schema.sql` deste projeto
4. Copie todo o conteúdo e cole no SQL Editor
5. Clique no botão **Run** ou pressione `Ctrl+Enter`
6. Você deve ver a mensagem "Success. No rows returned"

### Passo 3: Obter Credenciais

1. No menu lateral, vá em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Você verá duas credenciais importantes:
   - **Project URL**
   - **Project API keys** → **anon/public**

### Passo 4: Configurar o Projeto

1. Crie o arquivo `.env`:
```bash
cp .env.example .env
```

2. Edite `.env` com suas credenciais:
```env
VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...sua-chave-aqui
```

### Passo 5: Iniciar o Projeto

```bash
npm install
npm run dev
```

Pronto! Acesse `http://localhost:5173` e crie sua primeira conta.

---

## Verificações Importantes

### ✅ Checklist de Configuração

- [ ] Projeto Supabase criado
- [ ] Schema SQL executado sem erros
- [ ] Arquivo `.env` criado com as credenciais corretas
- [ ] Dependências instaladas (`npm install`)
- [ ] Projeto rodando localmente (`npm run dev`)
- [ ] Consegue criar uma conta nova
- [ ] Consegue fazer login
- [ ] Dashboard carrega corretamente

### 🔍 Verificar se o Schema foi Executado Corretamente

No Supabase, vá em **Table Editor**. Você deve ver as seguintes tabelas:
- users
- bank_accounts
- categories
- transactions
- budgets
- goals
- investments
- goal_contributions

### 🐛 Problemas Comuns

#### "Invalid API key"
- Verifique se copiou a chave correta (deve ser a **anon/public**, não a service_role)
- Certifique-se que não há espaços extras no arquivo `.env`
- Reinicie o servidor de desenvolvimento

#### "relation does not exist"
- O schema SQL não foi executado
- Execute novamente o conteúdo do arquivo `supabase-schema.sql`

#### "Failed to fetch"
- Verifique a URL do projeto (deve terminar com `.supabase.co`)
- Certifique-se que está com internet
- Verifique se o projeto Supabase está ativo

#### Categorias não aparecem após criar conta
- Verifique se o trigger foi criado corretamente
- Execute esta query no SQL Editor para criar categorias manualmente:
```sql
SELECT public.create_default_categories('seu-user-id-aqui');
```

---

## Estrutura do Banco de Dados

### Tabelas Principais

#### **users**
Armazena informações adicionais dos usuários (complementa auth.users do Supabase)
- `id`: UUID (referência ao auth.users)
- `email`: Email do usuário
- `name`: Nome completo
- `created_at`: Data de criação
- `settings`: Configurações em JSON

#### **categories**
Categorias de receitas e despesas
- `id`: UUID
- `user_id`: ID do usuário
- `name`: Nome da categoria
- `type`: 'income' ou 'expense'
- `color`: Cor em hexadecimal
- `icon`: Emoji/ícone

#### **transactions**
Transações financeiras (receitas e despesas)
- `id`: UUID
- `user_id`: ID do usuário
- `amount`: Valor (decimal)
- `description`: Descrição
- `category_id`: Categoria
- `date`: Data da transação
- `type`: 'income' ou 'expense'

### Row Level Security (RLS)

Todas as tabelas possuem políticas de segurança configuradas para garantir que:
- Usuários só podem ver seus próprios dados
- Usuários só podem modificar seus próprios dados
- Não há acesso cruzado entre usuários

---

## Recursos Avançados (Opcional)

### Habilitar Realtime

Se quiser atualizações em tempo real:

1. No Supabase, vá em **Database** → **Replication**
2. Habilite as tabelas que deseja monitorar:
   - transactions
   - categories

### Configurar Autenticação com Google

1. Vá em **Authentication** → **Providers**
2. Clique em **Google**
3. Siga as instruções para criar um OAuth app no Google Cloud
4. Cole as credenciais (Client ID e Secret)
5. Salve

### Backup do Banco

É sempre bom fazer backup:

1. Vá em **Database** → **Backups**
2. Configure backups automáticos (plano pago) ou
3. Use o SQL Editor para exportar dados manualmente

---

## Suporte

Se você encontrar problemas:

1. Verifique o console do navegador (F12) para erros
2. Verifique os logs do Supabase em **Logs** no painel
3. Consulte a documentação oficial: https://supabase.com/docs

---

**Pronto! Seu sistema financeiro está conectado ao Supabase! 🎉**


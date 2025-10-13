# Estrutura Completa do Sistema Fin

Este documento detalha toda a arquitetura e organização do sistema de gestão financeira.

## 📁 Estrutura de Diretórios

```
fin/
├── 📂 apoio/                      # Documentação de planejamento
│   ├── Arquitetura Proposta       # Detalhamento técnico da arquitetura
│   ├── Planejamento              # Plano completo do sistema
│   ├── Roadmap                   # Fases de implementação
│   └── Telas                     # Especificação das telas do MVP
│
├── 📂 src/
│   ├── 📂 components/            # Componentes React reutilizáveis
│   │   ├── 📂 ui/               # Componentes de UI base
│   │   │   ├── Button.tsx       # Botão customizado com variantes
│   │   │   ├── Input.tsx        # Input com label e validação
│   │   │   ├── Card.tsx         # Container de conteúdo
│   │   │   ├── Modal.tsx        # Modal/Dialog reutilizável
│   │   │   └── Loading.tsx      # Indicadores de carregamento
│   │   │
│   │   ├── ProtectedRoute.tsx   # HOC para rotas autenticadas
│   │   └── TransactionModal.tsx # Modal para criar/editar transações
│   │
│   ├── 📂 contexts/              # Contextos React (Estado Global)
│   │   └── AuthContext.tsx      # Gerenciamento de autenticação
│   │
│   ├── 📂 hooks/                 # Hooks customizados
│   │   ├── useTransactions.ts   # CRUD de transações
│   │   └── useCategories.ts     # CRUD de categorias
│   │
│   ├── 📂 lib/                   # Configurações e bibliotecas
│   │   └── supabase.ts          # Cliente Supabase configurado
│   │
│   ├── 📂 pages/                 # Páginas/Telas da aplicação
│   │   ├── Login.tsx            # Tela de login
│   │   ├── SignUp.tsx           # Tela de cadastro
│   │   ├── Onboarding.tsx       # Configuração inicial
│   │   ├── Dashboard.tsx        # Painel principal com KPIs
│   │   ├── Transactions.tsx     # Histórico completo
│   │   └── Settings.tsx         # Configurações e categorias
│   │
│   ├── 📂 types/                 # Tipos TypeScript
│   │   └── supabase.ts          # Tipos gerados do banco Supabase
│   │
│   ├── 📂 utils/                 # Funções utilitárias
│   │   └── formatters.ts        # Formatação de moeda, data, etc.
│   │
│   ├── App.tsx                   # Configuração de rotas principais
│   ├── main.tsx                  # Entry point da aplicação
│   └── index.css                 # Estilos globais + Tailwind
│
├── 📄 .env.example               # Template de variáveis de ambiente
├── 📄 .eslintrc.cjs             # Configuração do ESLint
├── 📄 .gitignore                # Arquivos ignorados pelo Git
├── 📄 index.html                # HTML base do projeto
├── 📄 package.json              # Dependências e scripts
├── 📄 postcss.config.js         # Configuração PostCSS
├── 📄 README.md                 # Documentação principal
├── 📄 SETUP_SUPABASE.md         # Guia de configuração do Supabase
├── 📄 supabase-schema.sql       # Schema do banco de dados
├── 📄 tailwind.config.js        # Configuração Tailwind CSS
├── 📄 tsconfig.json             # Configuração TypeScript
├── 📄 tsconfig.node.json        # TS config para Node
└── 📄 vite.config.ts            # Configuração Vite
```

## 🧩 Componentes Principais

### 1. **Componentes UI Base** (`src/components/ui/`)

#### Button
Botão reutilizável com múltiplas variantes e tamanhos.
```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Clique aqui
</Button>
```
**Variantes**: primary, secondary, danger, ghost
**Tamanhos**: sm, md, lg

#### Input
Campo de entrada com label e mensagens de erro.
```tsx
<Input
  label="Email"
  type="email"
  error={errors.email}
  {...register('email')}
/>
```

#### Card
Container estilizado para agrupar conteúdo.
```tsx
<Card>
  <h2>Título</h2>
  <p>Conteúdo</p>
</Card>
```

#### Modal
Modal/Dialog para exibir conteúdo sobreposto.
```tsx
<Modal isOpen={isOpen} onClose={handleClose} title="Título">
  Conteúdo do modal
</Modal>
```

### 2. **Componentes de Negócio**

#### TransactionModal
Modal especializado para criar e editar transações.
- Seletor de tipo (Receita/Despesa)
- Campos: valor, descrição, categoria, data
- Validação de formulário
- Integração com hooks de transações

#### ProtectedRoute
Componente de ordem superior (HOC) que protege rotas.
- Verifica autenticação
- Redireciona para login se não autenticado
- Exibe loading durante verificação

## 🎣 Hooks Customizados

### useTransactions
Gerencia operações CRUD de transações.
```tsx
const {
  transactions,      // Lista de transações
  loading,          // Estado de carregamento
  error,            // Erro se houver
  addTransaction,   // Adicionar nova
  updateTransaction,// Atualizar existente
  deleteTransaction,// Deletar
  refresh           // Recarregar dados
} = useTransactions(month, year)
```

### useCategories
Gerencia operações CRUD de categorias.
```tsx
const {
  categories,       // Lista de categorias
  loading,
  error,
  addCategory,
  updateCategory,
  deleteCategory,
  refresh
} = useCategories(type) // type: 'income' | 'expense' | undefined
```

## 🌐 Contextos

### AuthContext
Gerencia estado global de autenticação.
```tsx
const {
  user,             // Usuário autenticado
  profile,          // Perfil do usuário
  session,          // Sessão do Supabase
  loading,          // Carregando?
  signUp,           // Criar conta
  signIn,           // Login
  signOut,          // Logout
  updateProfile     // Atualizar perfil
} = useAuth()
```

## 📄 Páginas

### 1. Login (`/login`)
- Formulário de login (email/senha)
- Link para cadastro
- Link "Esqueceu senha?"

### 2. SignUp (`/signup`)
- Formulário de cadastro
- Validação de senha (mínimo 8 caracteres)
- Confirmação de senha
- Criação automática de categorias padrão

### 3. Onboarding (`/onboarding`)
- Coleta de renda mensal inicial
- Coleta de saldo atual
- Criação de transação inicial
- Criação de conta bancária
- Opcional (pode pular)

### 4. Dashboard (`/dashboard`)
**KPIs:**
- Receitas do mês
- Despesas do mês
- Saldo do mês (receitas - despesas)

**Visualizações:**
- Gráfico de pizza: gastos por categoria
- Lista de transações recentes (últimas 7)

**Ações:**
- Botão flutuante (+) para nova transação
- Navegação para histórico
- Navegação para configurações
- Logout

### 5. Transactions (`/transactions`)
- Listagem completa de transações
- Filtros por mês/ano
- Edição inline de transações
- Exclusão com confirmação
- Agrupamento por categoria

### 6. Settings (`/settings`)
**Seção Perfil:**
- Editar nome
- Visualizar email
- (Futuro: alterar senha)

**Seção Categorias:**
- Listar categorias de despesas
- Listar categorias de receitas
- Criar nova categoria (nome, tipo, ícone, cor)
- Editar categoria existente
- Deletar categoria (com confirmação)

## 🔧 Utilitários

### Formatters (`src/utils/formatters.ts`)
```tsx
formatCurrency(1000)           // "R$ 1.000,00"
formatDate("2024-01-15")       // "15/01/2024"
formatDateToInput(new Date())  // "2024-01-15"
getCurrentMonthYear()          // { month: 0, year: 2024 }
getMonthName(0)               // "Janeiro"
```

## 🗄️ Banco de Dados (Supabase)

### Tabelas

#### users
Dados adicionais dos usuários.
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  settings JSONB DEFAULT '{}'
);
```

#### categories
Categorias de receitas e despesas.
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')),
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT '📁',
  parent_id UUID REFERENCES categories(id)
);
```

#### transactions
Transações financeiras.
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  account_id UUID REFERENCES bank_accounts(id),
  amount NUMERIC(15,2) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')),
  is_recurring BOOLEAN DEFAULT FALSE
);
```

#### bank_accounts
Contas bancárias do usuário.
```sql
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  bank_name TEXT NOT NULL,
  account_number TEXT,
  balance NUMERIC(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);
```

#### budgets
Orçamentos por categoria (Fase 2).
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  category_id UUID REFERENCES categories(id),
  amount NUMERIC(15,2) NOT NULL,
  period TEXT CHECK (period IN ('monthly', 'yearly')),
  spent_amount NUMERIC(15,2) DEFAULT 0,
  alert_threshold NUMERIC(3,2) DEFAULT 0.80
);
```

#### goals
Metas financeiras (Fase 2).
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  target_amount NUMERIC(15,2) NOT NULL,
  current_amount NUMERIC(15,2) DEFAULT 0,
  target_date DATE NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'active'
);
```

#### investments
Carteira de investimentos (Fase 2).
```sql
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  symbol TEXT NOT NULL,
  asset_type TEXT CHECK (asset_type IN ('stock', 'fund', 'crypto', 'fixed_income', 'real_estate')),
  quantity NUMERIC(15,6) NOT NULL,
  avg_price NUMERIC(15,2) NOT NULL,
  current_price NUMERIC(15,2),
  broker TEXT
);
```

### Row Level Security (RLS)

Todas as tabelas possuem políticas de segurança:

```sql
-- Exemplo: usuários só veem suas próprias transações
CREATE POLICY "Users can manage their own transactions"
ON transactions FOR ALL
USING (auth.uid() = user_id);
```

### Triggers

#### Criação Automática de Categorias
Quando um usuário é criado, categorias padrão são automaticamente criadas:
- **Receitas**: Salário, Freelance
- **Despesas**: Moradia, Transporte, Alimentação, Lazer, Saúde, Educação, Outros

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

## 🎨 Estilização

### Tailwind CSS
O projeto usa Tailwind para estilização com tema customizado:

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: { /* tons de azul */ },
      success: { /* tons de verde */ },
      danger: { /* tons de vermelho */ },
    }
  }
}
```

### Paleta de Cores
- **Primary (Azul)**: `#0ea5e9` - Ações principais
- **Success (Verde)**: `#10b981` - Receitas, sucesso
- **Danger (Vermelho)**: `#ef4444` - Despesas, exclusão

## 🔒 Segurança

### Autenticação
- Gerenciada pelo Supabase Auth
- Senhas criptografadas com bcrypt
- Tokens JWT seguros
- Refresh tokens automáticos

### Row Level Security
- Políticas em todas as tabelas
- Usuários isolados
- Sem acesso cruzado

### Variáveis de Ambiente
- Credenciais em `.env` (não versionado)
- Validação de variáveis no client

## 📦 Dependências Principais

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",  // Cliente Supabase
    "react": "^18.2.0",                   // Framework
    "react-router-dom": "^6.21.0",       // Roteamento
    "recharts": "^2.10.3",               // Gráficos
    "lucide-react": "^0.303.0",          // Ícones
    "date-fns": "^3.0.6"                 // Datas
  },
  "devDependencies": {
    "typescript": "^5.2.2",              // Tipagem
    "vite": "^5.0.8",                    // Build tool
    "tailwindcss": "^3.4.0"              // CSS
  }
}
```

## 🚀 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview da build
npm run lint     # Executar ESLint
```

## 📈 Roadmap de Desenvolvimento

### ✅ Fase 1 - MVP (Concluído)
- Autenticação
- Dashboard com KPIs
- CRUD de transações
- Gerenciamento de categorias
- Gráficos básicos

### 🔄 Fase 2 - Planejado
- Sistema de orçamentos
- Metas financeiras
- Carteira de investimentos
- Relatórios em PDF
- Notificações

### 🔮 Fase 3 - Futuro
- Integração Open Finance
- Categorização com ML
- Projeções avançadas
- App mobile

---

**Este documento serve como referência completa da arquitetura do sistema.**


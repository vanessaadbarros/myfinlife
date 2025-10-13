# Fin - Sistema de Gestão Financeira Pessoal

Um sistema completo de organização financeira pessoal construído com React, TypeScript, Tailwind CSS e Supabase.

## 📋 Funcionalidades

### MVP - Fase 1 (Implementado)
- ✅ **Autenticação**: Sistema completo de login e cadastro
- ✅ **Onboarding**: Configuração inicial da conta do usuário
- ✅ **Dashboard**: Visão geral com KPIs (Receitas, Despesas, Saldo)
- ✅ **Transações**: CRUD completo de transações (receitas e despesas)
- ✅ **Categorias**: Gerenciamento completo de categorias personalizadas
- ✅ **Gráficos**: Visualização de gastos por categoria (gráfico de pizza)
- ✅ **Histórico**: Listagem completa com filtros por mês/ano
- ✅ **Configurações**: Gerenciamento de perfil e categorias

### Futuras Fases (Planejadas)
- 📊 Sistema de orçamentos com alertas
- 🎯 Metas financeiras com acompanhamento
- 💰 Carteira de investimentos
- 📈 Relatórios avançados em PDF
- 🔗 Integração Open Finance Brasil
- 🤖 Categorização inteligente com ML

## 🚀 Como Começar

### Pré-requisitos
- Node.js 18+ instalado
- Conta no Supabase (gratuita)

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Supabase

#### 2.1. Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta (se necessário)
3. Clique em "New Project"
4. Preencha os dados e aguarde a criação do projeto

#### 2.2. Executar o Schema SQL
1. No painel do Supabase, vá em **SQL Editor**
2. Abra o arquivo `supabase-schema.sql` deste projeto
3. Copie todo o conteúdo
4. Cole no SQL Editor do Supabase
5. Clique em **Run** para executar

Isso criará todas as tabelas, políticas de segurança, triggers e funções necessárias.

**✨ Nota**: O schema é idempotente, ou seja, pode ser executado múltiplas vezes sem causar erros!

#### 2.3. Obter Credenciais
1. No painel do Supabase, vá em **Settings** → **API**
2. Copie:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon/public key** (VITE_SUPABASE_ANON_KEY)

### 3. Configurar Variáveis de Ambiente
1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env` e adicione suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 4. Executar o Projeto
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

## 🏗️ Estrutura do Projeto

```
fin/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/             # Componentes de UI base
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Loading.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── TransactionModal.tsx
│   ├── contexts/           # Contextos React
│   │   └── AuthContext.tsx
│   ├── hooks/              # Hooks customizados
│   │   ├── useTransactions.ts
│   │   └── useCategories.ts
│   ├── lib/                # Configurações
│   │   └── supabase.ts
│   ├── pages/              # Páginas/Telas
│   │   ├── Login.tsx
│   │   ├── SignUp.tsx
│   │   ├── Onboarding.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Transactions.tsx
│   │   └── Settings.tsx
│   ├── types/              # Tipos TypeScript
│   │   └── supabase.ts
│   ├── utils/              # Funções utilitárias
│   │   └── formatters.ts
│   ├── App.tsx             # Configuração de rotas
│   ├── main.tsx           # Entry point
│   └── index.css          # Estilos globais
├── apoio/                  # Documentação de planejamento
│   ├── Arquitetura Proposta
│   ├── Planejamento
│   ├── Roadmap
│   └── Telas
├── supabase-schema.sql     # Schema do banco de dados
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🗄️ Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas no Supabase:

- **users**: Dados dos usuários
- **bank_accounts**: Contas bancárias
- **categories**: Categorias de receitas/despesas
- **transactions**: Transações financeiras
- **budgets**: Orçamentos por categoria
- **goals**: Metas financeiras
- **investments**: Carteira de investimentos
- **goal_contributions**: Aportes para metas

Todas as tabelas possuem **Row Level Security (RLS)** habilitado para garantir que cada usuário acesse apenas seus próprios dados.

## 🎨 Tecnologias Utilizadas

- **React 18**: Framework frontend
- **TypeScript**: Tipagem estática
- **Vite**: Build tool e dev server
- **Tailwind CSS**: Framework de estilização
- **Supabase**: Backend as a Service (PostgreSQL + Auth)
- **React Router**: Roteamento
- **Recharts**: Gráficos e visualizações
- **Lucide React**: Ícones
- **date-fns**: Manipulação de datas

## 📱 Telas do Sistema

### 1. **Login/Cadastro**
- Autenticação segura com Supabase Auth
- Validação de formulários
- Recuperação de senha

### 2. **Onboarding**
- Coleta de informações iniciais (renda e saldo)
- Criação automática de transação inicial
- Experiência guiada para novos usuários

### 3. **Dashboard**
- Cards com KPIs (Receitas, Despesas, Saldo do mês)
- Gráfico de pizza com gastos por categoria
- Lista de transações recentes
- Botão flutuante para adicionar transações

### 4. **Transações**
- Listagem completa de todas as transações
- Filtros por mês e ano
- Edição e exclusão de transações
- Interface intuitiva com ícones de categorias

### 5. **Configurações**
- Edição de perfil do usuário
- Gerenciamento completo de categorias
- Criação de categorias personalizadas com cores e ícones
- Separação entre categorias de receita e despesa

## 🔒 Segurança

- Autenticação gerenciada pelo Supabase Auth
- Row Level Security (RLS) em todas as tabelas
- Validação de dados no frontend e backend
- Senhas criptografadas automaticamente

## 🚀 Deploy

### Opção 1: Vercel
```bash
npm run build
# Faça deploy da pasta dist/
```

### Opção 2: Netlify
```bash
npm run build
# Faça deploy da pasta dist/
```

**Importante**: Não esqueça de configurar as variáveis de ambiente no serviço de hosting!

## 📈 Próximos Passos

Consulte o arquivo `apoio/Roadmap` para ver o planejamento completo das próximas fases:
- **Fase 2**: Metas, Investimentos e Relatórios
- **Fase 3**: Integrações avançadas e ML

## 🤝 Contribuindo

Este é um projeto pessoal, mas sugestões são bem-vindas! Abra uma issue para discutir melhorias.

## 📄 Licença

Este projeto é de uso pessoal.

---

**Desenvolvido com ❤️ usando React, TypeScript e Supabase**


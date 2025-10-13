# 📝 Como Criar o Arquivo .env

## 🎯 Passo a Passo

### Método 1: Criar Manualmente (Recomendado)

1. **Crie um novo arquivo** na raiz do projeto chamado `.env` (com o ponto no início)

2. **Copie e cole este conteúdo** dentro do arquivo:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

3. **Preencha com suas credenciais** do Supabase (veja seção abaixo)

---

### Método 2: Usar o Terminal

No terminal (PowerShell ou CMD), na pasta do projeto:

#### Windows PowerShell:
```powershell
# Criar o arquivo .env
New-Item -Path .env -ItemType File

# Ou copiar o template
Copy-Item env.example.txt .env
```

#### Windows CMD:
```cmd
copy env.example.txt .env
```

#### Git Bash (se tiver):
```bash
cp env.example.txt .env
```

---

## 🔑 Onde Encontrar as Credenciais

### 1. Acesse seu projeto no Supabase
https://supabase.com/dashboard

### 2. Vá em Settings → API
No menu lateral esquerdo: **Settings** (ícone de engrenagem) → **API**

### 3. Copie as credenciais:

#### Project URL (VITE_SUPABASE_URL):
- Está na seção **Config**
- Formato: `https://seu-projeto-id.supabase.co`
- Exemplo: `https://abcdefghijk.supabase.co`

#### anon/public key (VITE_SUPABASE_ANON_KEY):
- Está na seção **Project API keys**
- Procure por **anon** / **public**
- É uma chave longa que começa com `eyJ...`
- Exemplo: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ...`

---

## 📄 Exemplo de .env Preenchido

```env
VITE_SUPABASE_URL=https://xyzabc123456.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYzEyMzQ1NiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk1MDAwMDAwLCJleHAiOjE4NTI3Njc1OTl9.abcdefghijklmnopqrstuvwxyz1234567890
```

**⚠️ Importante**: Estes são apenas exemplos! Use suas próprias credenciais.

---

## ✅ Verificar se Funcionou

### 1. Verifique se o arquivo existe:
Na raiz do projeto, você deve ver o arquivo `.env` (pode não aparecer em alguns exploradores por começar com ponto)

### 2. Teste no terminal:
```powershell
# PowerShell
Get-Content .env

# CMD
type .env
```

Deve mostrar o conteúdo do arquivo.

### 3. Execute o projeto:
```bash
npm run dev
```

Se aparecer o erro "Supabase URL ou Anon Key não configuradas", o arquivo não foi criado ou está vazio.

---

## 🐛 Problemas Comuns

### Arquivo .env não aparece no VSCode
- Isso é normal! Arquivos que começam com ponto são ocultos
- Você pode abrir pelo terminal: `code .env`
- Ou usar File → Open File → digite `.env`

### Erro: "Invalid API key"
- Verifique se copiou a chave **anon/public** (não a service_role)
- Certifique-se que não há espaços antes ou depois das credenciais
- As variáveis devem estar sem aspas

### Arquivo está vazio
```env
# Correto:
VITE_SUPABASE_URL=https://seu-projeto.supabase.co

# Errado (vazio):
VITE_SUPABASE_URL=
```

---

## 🔒 Segurança

✅ O arquivo `.env` já está no `.gitignore`
✅ Suas credenciais NÃO serão enviadas para o Git
✅ Nunca compartilhe o arquivo `.env`
✅ Use apenas a chave **anon/public** (não a service_role)

---

## 📋 Checklist Final

Antes de executar `npm run dev`, verifique:

- [ ] Arquivo `.env` criado na raiz do projeto
- [ ] Variável `VITE_SUPABASE_URL` preenchida
- [ ] Variável `VITE_SUPABASE_ANON_KEY` preenchida
- [ ] Sem espaços extras ou aspas
- [ ] Credenciais copiadas do Supabase Dashboard → Settings → API

---

## 🆘 Ainda com Dúvidas?

Se precisar de ajuda:
1. Verifique o console do navegador (F12)
2. Verifique se o projeto Supabase está ativo
3. Tente copiar as credenciais novamente

---

**Depois de criar o .env, execute:**
```bash
npm run dev
```

E acesse: http://localhost:5173

**Boa sorte! 🚀**


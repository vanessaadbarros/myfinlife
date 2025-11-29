# 🔐 Configurar Variáveis de Ambiente na Vercel

## ❌ **ERRO ATUAL:**

O site deployou com sucesso, mas está faltando as credenciais do Supabase:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## ✅ **SOLUÇÃO: Adicionar na Vercel**

### **Passo 1: Pegar suas credenciais do Supabase**

Você já tem essas informações no seu arquivo `.env` local.

**Opção A: Ver o arquivo `.env`**
```bash
cat .env
```

**Opção B: Pegar do Supabase Dashboard**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **Settings** → **API**
4. Copie:
   - **Project URL** (URL)
   - **anon public** key (KEY)

---

### **Passo 2: Adicionar na Vercel**

1. **Acesse:** https://vercel.com/dashboard
2. **Clique** no seu projeto (`myfinlife`)
3. **Vá em:** **Settings** (no menu lateral)
4. **Clique em:** **Environment Variables** (no menu esquerdo)
5. **Adicione as variáveis:**

   **Variável 1:**
   ```
   Name:  VITE_SUPABASE_URL
   Value: https://seu-projeto.supabase.co
   ```
   - Environment: **Production, Preview, Development** (marque todos)
   - Clique em **Save**

   **Variável 2:**
   ```
   Name:  VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS... (seu token completo)
   ```
   - Environment: **Production, Preview, Development** (marque todos)
   - Clique em **Save**

---

### **Passo 3: Fazer Redeploy**

Após adicionar as variáveis, você precisa fazer um novo deploy:

**Opção A: Pela Interface da Vercel**
1. Vá em **Deployments**
2. Clique nos **3 pontinhos** do último deploy
3. Clique em **Redeploy**
4. Confirme

**Opção B: Fazer um novo push**
```bash
# Qualquer mudança pequena serve
git commit --allow-empty -m "🔧 Trigger redeploy"
git push origin main
```

---

## 🎯 **GUIA VISUAL:**

### **1. Vercel Dashboard → Seu Projeto**
```
┌────────────────────────────────────────┐
│  myfinlife                             │
│  ┌────────────────────────────────────┤
│  │ Overview                           │
│  │ Deployments                        │
│  │ Analytics                          │
│  │ Logs                               │
│  │ Speed Insights                     │
│  │ ▶ Settings ← CLIQUE AQUI          │
│  └────────────────────────────────────│
└────────────────────────────────────────┘
```

### **2. Settings → Environment Variables**
```
┌────────────────────────────────────────┐
│  Settings                              │
│  ┌────────────────────────────────────┤
│  │ General                            │
│  │ Domains                            │
│  │ Git                                │
│  │ ▶ Environment Variables ← AQUI    │
│  │ Security                           │
│  └────────────────────────────────────│
└────────────────────────────────────────┘
```

### **3. Add Environment Variable**
```
┌────────────────────────────────────────────────────────┐
│  Environment Variables                                 │
│  ┌────────────────────────────────────────────────────┤
│  │                                                    │
│  │  Name                                              │
│  │  ┌──────────────────────────────────────────────┐ │
│  │  │ VITE_SUPABASE_URL                            │ │
│  │  └──────────────────────────────────────────────┘ │
│  │                                                    │
│  │  Value                                             │
│  │  ┌──────────────────────────────────────────────┐ │
│  │  │ https://seu-projeto.supabase.co              │ │
│  │  └──────────────────────────────────────────────┘ │
│  │                                                    │
│  │  Environments                                      │
│  │  ☑ Production  ☑ Preview  ☑ Development          │
│  │                                                    │
│  │  [Add]                                             │
│  └────────────────────────────────────────────────────┘
└────────────────────────────────────────────────────────┘
```

---

## 📋 **CHECKLIST:**

- [ ] Pegar `VITE_SUPABASE_URL` do `.env` ou Supabase
- [ ] Pegar `VITE_SUPABASE_ANON_KEY` do `.env` ou Supabase
- [ ] Acessar Vercel Dashboard
- [ ] Ir em Settings → Environment Variables
- [ ] Adicionar `VITE_SUPABASE_URL`
- [ ] Adicionar `VITE_SUPABASE_ANON_KEY`
- [ ] Marcar todos os environments (Production, Preview, Development)
- [ ] Fazer Redeploy
- [ ] Testar o site ✅

---

## 🔍 **COMO PEGAR AS CREDENCIAIS:**

### **Do arquivo .env local:**

**No Git Bash:**
```bash
cat .env
```

Você verá algo como:
```
VITE_SUPABASE_URL=https://xyzabc123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Copie esses valores!**

---

### **Do Supabase Dashboard:**

1. Acesse: https://supabase.com/dashboard
2. Clique no seu projeto
3. No menu lateral: **Settings** ⚙️
4. Clique em: **API**
5. Você verá:
   ```
   Project URL
   https://xyzabc123.supabase.co
   
   Project API keys
   anon public
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 🎉 **DEPOIS DE CONFIGURAR:**

1. ✅ Aguarde o redeploy (2-3 minutos)
2. ✅ Acesse seu site
3. ✅ Site funcionando perfeitamente!
4. ✅ Login e todas funcionalidades OK

---

## ⚠️ **IMPORTANTE:**

### **NUNCA faça isso:**
- ❌ Commitar o `.env` no GitHub
- ❌ Compartilhar suas keys publicamente
- ❌ Usar as keys de produção em desenvolvimento compartilhado

### **SEMPRE faça isso:**
- ✅ Manter `.env` no `.gitignore`
- ✅ Configurar env vars na Vercel
- ✅ Usar keys diferentes para dev/prod (se possível)

---

## 🚀 **COMANDOS RÁPIDOS:**

**Ver suas credenciais locais:**
```bash
cat .env
```

**Fazer redeploy via push:**
```bash
git commit --allow-empty -m "🔧 Trigger redeploy após config env vars"
git push origin main
```

---

## 📝 **RESUMO:**

1. 🔑 Pegue credenciais do `.env` ou Supabase Dashboard
2. ⚙️ Vá em Vercel → Settings → Environment Variables
3. ➕ Adicione as 2 variáveis
4. 🔄 Faça redeploy
5. ✅ Site funcionando!

---

**Precisa de ajuda? Me avise!** 💪






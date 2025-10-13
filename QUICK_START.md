# 🚀 Início Rápido - 5 Minutos

Guia express para colocar o sistema no ar rapidamente.

## ⚡ Passo a Passo Rápido

### 1️⃣ Instalar Dependências (1 min)
```bash
npm install
```

### 2️⃣ Configurar Supabase (2 min)

**Opção A - Já tem projeto Supabase:**
1. Execute o SQL: Copie `supabase-schema.sql` → SQL Editor do Supabase → Run
2. Pegue as credenciais: Settings → API
3. Crie `.env` com suas credenciais

**Opção B - Criar novo projeto:**
1. Vá em https://supabase.com → New Project
2. Aguarde 1-2 minutos
3. SQL Editor → Cole `supabase-schema.sql` → Run
4. Settings → API → Copie URL e anon key

### 3️⃣ Configurar Ambiente (30 seg)
```bash
cp .env.example .env
```

Edite `.env`:
```env
VITE_SUPABASE_URL=sua-url-aqui
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

### 4️⃣ Rodar (30 seg)
```bash
npm run dev
```

Abra: `http://localhost:5173`

### 5️⃣ Testar (1 min)
1. Clique em "Cadastre-se"
2. Preencha nome, email e senha
3. Faça login
4. Configure onboarding (ou pule)
5. Explore o dashboard!

---

## ✅ Checklist Rápido

- [ ] `npm install` executado
- [ ] Projeto Supabase criado
- [ ] SQL schema executado
- [ ] Arquivo `.env` configurado
- [ ] `npm run dev` rodando
- [ ] Acessou `http://localhost:5173`
- [ ] Criou uma conta
- [ ] Dashboard carregou

## 🆘 Problemas?

### "Invalid API key"
→ Verifique o arquivo `.env`, copie novamente as credenciais

### "relation does not exist"
→ Execute o `supabase-schema.sql` no SQL Editor

### Página em branco
→ Abra o console (F12) e veja o erro

---

## 📚 Próximos Passos

✅ Sistema funcionando? Ótimo!

Agora explore:
- **Dashboard**: Visão geral das finanças
- **Botão +**: Adicionar transações
- **Histórico**: Ver todas as transações
- **Configurações**: Gerenciar categorias

---

## 🎯 Funcionalidades Principais

### ➕ Adicionar Transação
1. Clique no botão **+** (canto inferior direito)
2. Escolha: Receita ou Despesa
3. Preencha valor, descrição, categoria e data
4. Clique em Salvar

### 📊 Ver Estatísticas
No dashboard você vê:
- Total de receitas do mês
- Total de despesas do mês
- Saldo (receitas - despesas)
- Gráfico de gastos por categoria

### 🏷️ Gerenciar Categorias
1. Vá em Configurações (ícone de engrenagem)
2. Role até "Gerenciar Categorias"
3. Clique em "+ Nova Categoria"
4. Personalize: nome, tipo, ícone e cor

---

## 📱 Primeiro Uso Recomendado

1. **Configure suas categorias**
   - Vá em Configurações
   - Adicione/edite categorias que você usa
   - Ex: "Netflix", "Supermercado", "Academia"

2. **Adicione suas transações do mês**
   - Use o botão + no dashboard
   - Adicione receitas e despesas recentes

3. **Visualize os resultados**
   - Veja o gráfico atualizar
   - Acompanhe seu saldo mensal

---

## 🔥 Dicas Pro

- **Categorias descritivas**: Use nomes claros (ex: "Streaming" em vez de "Netflix")
- **Emojis ajudam**: Use emojis nas categorias para identificar rápido
- **Histórico**: Filtre por mês para ver gastos passados
- **Consistência**: Adicione transações regularmente

---

## 📖 Documentação Completa

Para mais detalhes, consulte:
- `README.md` - Documentação principal
- `SETUP_SUPABASE.md` - Guia detalhado do Supabase
- `ESTRUTURA_COMPLETA.md` - Arquitetura do sistema

---

**Pronto! Você está gerenciando suas finanças! 💰**


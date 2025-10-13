# ⚠️ Informações Importantes

## 🔐 Segurança

### ✅ O que está seguro:
- ✅ Senhas criptografadas pelo Supabase (bcrypt)
- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ Tokens JWT com refresh automático
- ✅ HTTPS obrigatório em produção (Supabase)
- ✅ Credenciais em variáveis de ambiente (.env não versionado)

### ⚠️ Nunca faça:
- ❌ Compartilhe seu arquivo `.env`
- ❌ Commite o `.env` no Git
- ❌ Use a chave `service_role` no frontend
- ❌ Desabilite RLS nas tabelas
- ❌ Exponha credenciais em código público

### 🔒 Boas Práticas:
- Use senhas fortes (mínimo 8 caracteres)
- Ative 2FA no Supabase Dashboard
- Revogue tokens em caso de suspeita
- Faça backups regulares do banco

---

## 💾 Dados

### Onde seus dados estão:
- **Banco de Dados**: Supabase (PostgreSQL hospedado)
- **Autenticação**: Supabase Auth
- **Localização**: Conforme região escolhida no projeto

### Política de Dados:
- Seus dados são **privados** e isolados (RLS)
- Você pode **exportar** via SQL Editor
- Você pode **deletar** sua conta a qualquer momento
- Backups automáticos (plano pago do Supabase)

### Backup Manual:
```sql
-- No SQL Editor do Supabase
COPY (SELECT * FROM transactions WHERE user_id = 'seu-id') TO STDOUT WITH CSV HEADER;
```

---

## 🌐 Limites do Plano Gratuito Supabase

### Plano Free (Gratuito):
- ✅ 500 MB de banco de dados
- ✅ 1 GB de armazenamento de arquivos
- ✅ 2 GB de transferência
- ✅ 50.000 usuários autenticados/mês
- ✅ Projetos pausam após 1 semana de inatividade

### Estimativa de Uso:
- **1 usuário**: ~1-5 MB/ano de dados
- **100 transações/mês**: ~10 KB
- **Espaço para ~1000 usuários** no plano free

### Se precisar de mais:
- Upgrade para plano Pro ($25/mês)
- Limites maiores e sem pausa de inatividade

---

## 🔧 Manutenção

### Tarefas Regulares:

#### Mensais:
- [ ] Verificar uso do banco (Dashboard → Usage)
- [ ] Revisar logs de erro (Logs → Explorer)
- [ ] Atualizar dependências npm

#### Semestrais:
- [ ] Backup completo do banco
- [ ] Revisar políticas de segurança
- [ ] Otimizar consultas lentas

### Comandos Úteis:
```bash
# Atualizar dependências
npm update

# Verificar vulnerabilidades
npm audit

# Build de produção
npm run build
```

---

## 🚀 Deploy em Produção

### Passos Recomendados:

1. **Build do Projeto**
```bash
npm run build
```

2. **Deploy (Vercel/Netlify)**
   - Conecte seu repositório Git
   - Configure variáveis de ambiente
   - Deploy automático a cada push

3. **Configurar Variáveis**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. **Configurar Domínio Custom**
   - Configure DNS
   - Habilite HTTPS (automático)

### Plataformas Recomendadas:
- **Vercel**: Deploy automático, HTTPS gratuito
- **Netlify**: Similar ao Vercel
- **GitHub Pages**: Apenas para sites estáticos

---

## 📊 Performance

### Otimizações Implementadas:
- ✅ Índices no banco para consultas rápidas
- ✅ Paginação implícita (últimas transações)
- ✅ Cache de categorias no estado
- ✅ Lazy loading de componentes (futuro)

### Dicas de Performance:
- Evite carregar transações de anos inteiros
- Use filtros de data nas queries
- Limite exibição a 100 itens por vez

### Monitoramento:
```bash
# Lighthouse (performance do frontend)
npm run build
npm run preview
# Abra DevTools → Lighthouse → Run

# Query performance (Supabase)
# Dashboard → Database → Query Performance
```

---

## 🐛 Debug e Troubleshooting

### Console de Desenvolvimento:
Sempre abra o console (F12) para ver erros:
```javascript
// Logs úteis aparecem aqui
console.log('Estado atual:', state)
```

### Erros Comuns:

#### "Invalid API key"
**Causa**: Credenciais erradas no `.env`
**Solução**: Reconfigure o `.env` com credenciais corretas

#### "Failed to fetch"
**Causa**: Supabase offline ou credenciais erradas
**Solução**: Verifique URL do projeto e conexão

#### "relation does not exist"
**Causa**: Schema SQL não foi executado
**Solução**: Execute `supabase-schema.sql` no SQL Editor

#### Página em branco
**Causa**: Erro de JavaScript
**Solução**: Abra console (F12) e veja o erro específico

### Logs do Supabase:
Dashboard → Logs → Explorer
- Veja erros de autenticação
- Veja queries SQL executadas
- Veja erros de políticas RLS

---

## 🔄 Atualizações Futuras

### Como atualizar o sistema:

1. **Pull das mudanças**
```bash
git pull origin main
```

2. **Atualizar dependências**
```bash
npm install
```

3. **Executar migrations (se houver)**
```sql
-- Será fornecido em releases futuras
```

4. **Testar localmente**
```bash
npm run dev
```

5. **Deploy**
```bash
npm run build
# Deploy no seu serviço
```

### Versionamento:
- Versão atual: **v1.0.0 (MVP)**
- Próxima: **v1.1.0** (Orçamentos)
- Roadmap completo: Veja `apoio/Roadmap`

---

## 📞 Suporte

### Recursos Oficiais:
- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Tailwind Docs**: https://tailwindcss.com

### Community:
- **Supabase Discord**: https://discord.supabase.com
- **Stack Overflow**: Tag `supabase`

### Issues Conhecidos:
Nenhum no momento. Reporte bugs!

---

## ✅ Checklist de Produção

Antes de ir para produção, verifique:

### Segurança:
- [ ] RLS habilitado em todas as tabelas
- [ ] Variáveis de ambiente configuradas
- [ ] HTTPS habilitado
- [ ] Senhas fortes obrigatórias

### Performance:
- [ ] Build de produção testado
- [ ] Lighthouse score > 90
- [ ] Queries otimizadas
- [ ] Imagens comprimidas

### Funcionalidades:
- [ ] Todos os fluxos testados
- [ ] Login/Cadastro funcionando
- [ ] Transações sendo salvas
- [ ] Gráficos carregando

### Monitoramento:
- [ ] Logs configurados
- [ ] Alertas de erro (opcional)
- [ ] Analytics (opcional)

---

## 💡 Dicas Finais

### Para Desenvolvimento:
- Use React DevTools para debugar
- Use Supabase Studio para ver dados
- Commit frequentemente
- Teste em diferentes navegadores

### Para Uso Pessoal:
- Adicione transações regularmente
- Revise seus gastos mensalmente
- Ajuste categorias conforme necessário
- Use o sistema como ferramenta de planejamento

### Para Evolução:
- Consulte o `Roadmap` para próximas features
- Sugira melhorias
- Compartilhe feedback

---

**Sistema desenvolvido com foco em segurança, performance e experiência do usuário! 🚀**


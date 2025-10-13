# 🔧 Como Instalar o Git no Windows

## ⚠️ Git não está instalado!

Você precisa instalar o Git antes de conectar ao GitHub.

---

## 📥 Passo 1: Baixar o Git

### **Opção A: Site Oficial (Recomendado)**
1. Acesse: https://git-scm.com/download/win
2. O download deve iniciar automaticamente
3. Se não iniciar, clique em **"Click here to download manually"**

### **Opção B: Link Direto**
- 64-bit: https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe

---

## 🛠️ Passo 2: Instalar o Git

1. **Execute o instalador** (`Git-2.43.0-64-bit.exe`)

2. **Configurações Recomendadas:**

   **Tela "Select Components":**
   - ✅ Windows Explorer integration
   - ✅ Git Bash Here
   - ✅ Git GUI Here
   - ✅ Associate .git* configuration files
   - ✅ Associate .sh files to be run with Bash

   **Tela "Choosing the default editor":**
   - Escolha: **"Use Visual Studio Code as Git's default editor"** (se tiver o VS Code)
   - Ou: **"Use Notepad++ as Git's default editor"**
   - Ou: Deixe o padrão (Vim)

   **Tela "Adjusting your PATH environment":**
   - ✅ **"Git from the command line and also from 3rd-party software"** ← IMPORTANTE!

   **Tela "Choosing HTTPS transport backend":**
   - ✅ Use the OpenSSL library

   **Tela "Configuring the line ending conversions":**
   - ✅ Checkout Windows-style, commit Unix-style line endings

   **Tela "Configuring the terminal emulator":**
   - ✅ Use MinTTY (the default terminal of MSYS2)

   **Tela "Configuring extra options":**
   - ✅ Enable file system caching
   - ✅ Enable symbolic links

3. **Clique em "Install"**

4. **Clique em "Finish"**

---

## ✅ Passo 3: Verificar Instalação

1. **Feche e reabra** o PowerShell/Terminal

2. **Digite:**
   ```bash
   git --version
   ```

3. **Deve aparecer algo como:**
   ```
   git version 2.43.0.windows.1
   ```

Se aparecer isso, o Git foi instalado com sucesso! 🎉

---

## ⚙️ Passo 4: Configurar o Git

Após instalar, configure seu nome e email:

```bash
# Seu nome (aparecerá nos commits)
git config --global user.name "Seu Nome Completo"

# Seu email (use o mesmo do GitHub)
git config --global user.email "seu-email@exemplo.com"

# Verificar configuração
git config --global --list
```

---

## 🎯 Passo 5: Voltar para o Projeto

Após instalar e configurar o Git:

1. **Abra o PowerShell/Terminal**
2. **Navegue até a pasta do projeto:**
   ```bash
   cd "C:\Users\vanes\OneDrive\Área de Trabalho\Projetos\fin"
   ```
3. **Siga o guia**: Abra o arquivo `CONECTAR_GITHUB.md`

---

## 🚀 Alternativa: GitHub Desktop

Se você preferir uma interface gráfica (sem linha de comando):

### **Baixar GitHub Desktop:**
- Link: https://desktop.github.com/
- Vantagens:
  - ✅ Interface visual amigável
  - ✅ Git incluído (não precisa instalar separado)
  - ✅ Integração direta com GitHub
  - ✅ Mais fácil para iniciantes

### **Usar GitHub Desktop:**
1. Baixe e instale
2. Faça login com sua conta GitHub
3. **File** → **Add Local Repository**
4. Selecione a pasta do projeto
5. **Publish repository** → Escolha o nome
6. Pronto! Interface visual para tudo

---

## 📱 Outra Alternativa: GitHub CLI

### **Instalar via Winget:**
```bash
winget install --id GitHub.cli
```

### **Instalar via Chocolatey:**
```bash
choco install gh
```

### **Download Manual:**
- Link: https://cli.github.com/

---

## ❓ Problemas Comuns

### **"git: command not found" depois de instalar**
**Solução:**
1. Feche e reabra o terminal completamente
2. Se não funcionar, reinicie o computador
3. Verifique se marcou "Git from the command line" na instalação

### **"Permission denied" ou erro de permissão**
**Solução:**
- Execute o PowerShell/CMD como Administrador

### **Instalador não abre**
**Solução:**
- Clique com botão direito → "Executar como Administrador"
- Desabilite temporariamente o antivírus

---

## 🎓 O que é o Git?

**Git** é um sistema de controle de versão que permite:
- 📝 Rastrear alterações no código
- 🔄 Voltar para versões anteriores
- 👥 Colaborar com outras pessoas
- 🌿 Trabalhar em branches (ramificações)
- 💾 Fazer backup do código

**GitHub** é uma plataforma online que hospeda repositórios Git:
- ☁️ Armazena seu código na nuvem
- 👥 Compartilha projetos
- 🤝 Facilita colaboração
- 📊 Mostra portfólio profissional

---

## 📚 Recursos Úteis

- **Git Download**: https://git-scm.com/download/win
- **GitHub Desktop**: https://desktop.github.com/
- **Documentação Git**: https://git-scm.com/doc
- **Tutorial Visual**: https://learngitbranching.js.org/

---

## ✅ Checklist de Instalação

- [ ] Git baixado
- [ ] Git instalado
- [ ] Terminal fechado e reaberto
- [ ] `git --version` funcionando
- [ ] Nome configurado (`git config --global user.name`)
- [ ] Email configurado (`git config --global user.email`)
- [ ] Pronto para usar!

---

## 🎯 Próximos Passos

Após instalar e configurar o Git:

1. ✅ Abra o arquivo **`CONECTAR_GITHUB.md`**
2. ✅ Siga as instruções a partir do **Passo 2**
3. ✅ Crie sua conta no GitHub (se não tiver)
4. ✅ Conecte seu projeto ao GitHub

---

## 💡 Dica Final

Se você é iniciante com Git, recomendo:
1. **Instalar GitHub Desktop** (mais fácil, interface visual)
2. **OU** instalar Git tradicional + aprender comandos básicos

Ambos são excelentes! GitHub Desktop é mais amigável para começar. 😊

---

**Precisa de ajuda com a instalação? Me avise!** 🚀


# 🤖 Claude - Guia de Commit e Deploy para MesaRPG

Este documento contém instruções padronizadas para fazer commits e deploys corretos no projeto MesaRPG.

## 📋 **CHECKLIST PRÉ-COMMIT**

### ✅ **1. Verificar Estado do Projeto**
```bash
# Verificar diretório atual
pwd
# Deve estar em: /Users/guilherme/Documents/GitHub/mesarpg-dev

# Verificar status do git
git status

# Verificar branch atual
git branch
# Deve estar em: develop
```

### ✅ **2. Testar Build**
```bash
# Testar compilação TypeScript
npx tsc --noEmit

# Testar build do Next.js
pnpm build

# Verificar se não há erros
# ✅ Compiled successfully
# ✅ Generating static pages (6/6)
```

### ✅ **3. Verificar Dependências**
```bash
# Verificar vulnerabilidades
pnpm audit

# Deve retornar: "No known vulnerabilities found"
```

## 🔧 **PROCESSO DE COMMIT PADRONIZADO**

### **1. Adicionar Arquivos**
```bash
# Adicionar todos os arquivos modificados
git add .

# OU adicionar arquivos específicos
git add caminho/para/arquivo.tsx
```

### **2. Commit com Mensagem Padronizada**

#### **🎯 Formato da Mensagem:**
```
tipo: descrição breve

🎮 DETALHES DA ALTERAÇÃO

✅ Funcionalidades Implementadas:
• Item 1
• Item 2
• Item 3

✅ Correções Técnicas:
• Correção 1
• Correção 2

✅ Melhorias:
• Melhoria 1
• Melhoria 2

🎯 Resultado: Descrição do resultado final
```

#### **📝 Tipos de Commit:**
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `refactor:` - Refatoração de código
- `style:` - Mudanças de estilo/formatação
- `docs:` - Documentação
- `test:` - Testes
- `chore:` - Tarefas de manutenção

#### **💡 Exemplos de Commits:**

**Nova Funcionalidade:**
```bash
git commit -m "feat: implement character sheet auto-save system

🎮 SISTEMA DE AUTO-SAVE IMPLEMENTADO

✅ Funcionalidades Implementadas:
• Auto-save a cada 2 segundos com debounce
• Indicador visual de status (Salvando/Salvo/Erro)
• Preservação automática de dados
• Feedback claro para o usuário

✅ Componentes Criados:
• AutoSaveIndicator: Feedback visual
• useDebounce: Hook para auto-save
• CharacterForm: Formulário com auto-save

🎯 Resultado: Jogadores nunca perdem dados da ficha"
```

**Correção de Bug:**
```bash
git commit -m "fix: resolve Next.js 15 params Promise compatibility

🔧 CORREÇÃO DE COMPATIBILIDADE

✅ Problemas Resolvidos:
• Params agora são Promise em Next.js 15
• useEffect para resolução assíncrona
• Todas as páginas de personagem corrigidas

✅ Arquivos Corrigidos:
• app/campanhas/[id]/personagem/page.tsx
• app/campanhas/[id]/personagem/novo/page.tsx
• app/campanhas/[id]/personagem/[characterId]/page.tsx

🎯 Resultado: Compatibilidade 100% com Next.js 15"
```

**Refatoração:**
```bash
git commit -m "refactor: simplify character sheet layout

🎨 SIMPLIFICAÇÃO DE INTERFACE

✅ Melhorias Implementadas:
• Removido preview lateral desnecessário
• Layout em coluna única centralizado
• Interface mais limpa e focada
• Melhor responsividade

✅ Componentes Otimizados:
• CharacterCreationForm: Layout simplificado
• ImageUpload: Preview direto no campo

🎯 Resultado: Interface mais limpa e funcional"
```

### **3. Push para Repositório**
```bash
# Push para branch develop
git push origin develop

# Verificar se o push foi bem-sucedido
# ✅ Deve mostrar: "develop -> develop"
```

## 🚀 **PROCESSO DE DEPLOY PADRONIZADO**

### **1. Deploy na Vercel**
```bash
# Deploy em produção
vercel --prod

# Aguardar conclusão do build
# ✅ Production: https://mesarpg-xxx.vercel.app
# ✅ Build Completed in /vercel/output [~30s]
```

### **2. Verificar Deploy**
```bash
# Verificar se o build foi bem-sucedido
# ✅ Compiled successfully
# ✅ Generating static pages (6/6)
# ✅ Build Completed

# Anotar URL de produção para testes
```

### **3. Teste Pós-Deploy**
- [ ] Acessar URL de produção
- [ ] Testar login/logout
- [ ] Testar criação de campanha
- [ ] Testar criação de personagem
- [ ] Testar upload de imagem
- [ ] Verificar responsividade

## 📊 **MÉTRICAS DE QUALIDADE**

### **✅ Build Saudável:**
```
✓ Compiled successfully
✓ Generating static pages (6/6)
✓ Build Completed in /vercel/output [<35s]
```

### **✅ Rotas Funcionais:**
```
├ ○ /                                           ~500 B
├ ○ /dashboard                                  ~7 kB
├ ƒ /campanhas/[id]                            ~22 kB
├ ƒ /campanhas/[id]/personagem                 ~5 kB
├ ƒ /campanhas/[id]/personagem/novo            ~2 kB
├ ƒ /campanhas/[id]/personagem/[characterId]   ~2 kB
├ ƒ /campanhas/[id]/settings                   ~35 kB
├ ƒ /invite/[token]                            ~6 kB
└ ○ /login                                     ~5 kB
```

### **✅ Dependências Saudáveis:**
```
✅ No known vulnerabilities found
✅ TypeScript: 0 errors
✅ Build: Successful
```

## 🚨 **TROUBLESHOOTING**

### **❌ Erro de Build:**
```bash
# Se houver erro de TypeScript
npx tsc --noEmit
# Corrigir erros antes de continuar

# Se houver erro de dependências
pnpm install
pnpm audit fix
```

### **❌ Erro de Deploy:**
```bash
# Verificar logs do Vercel
# Acessar: https://vercel.com/guiperezgo/mesarpg

# Re-tentar deploy
vercel --prod --force
```

### **❌ Erro de Git:**
```bash
# Se houver conflitos
git status
git pull origin develop
# Resolver conflitos manualmente
git add .
git commit -m "resolve merge conflicts"
git push origin develop
```

## 📝 **TEMPLATES DE COMMIT RÁPIDOS**

### **🆕 Nova Funcionalidade:**
```bash
git add . && git commit -m "feat: [DESCRIÇÃO]

🎮 [TÍTULO DA FUNCIONALIDADE]

✅ Funcionalidades Implementadas:
• [Item 1]
• [Item 2]

🎯 Resultado: [Resultado final]"
```

### **🔧 Correção de Bug:**
```bash
git add . && git commit -m "fix: [DESCRIÇÃO]

🔧 CORREÇÃO DE BUG

✅ Problemas Resolvidos:
• [Problema 1]
• [Problema 2]

🎯 Resultado: [Sistema funcionando]"
```

### **🎨 Melhoria de Interface:**
```bash
git add . && git commit -m "style: [DESCRIÇÃO]

🎨 MELHORIA DE INTERFACE

✅ Melhorias Implementadas:
• [Melhoria 1]
• [Melhoria 2]

🎯 Resultado: [Interface melhorada]"
```

## 🎯 **FLUXO COMPLETO RESUMIDO**

```bash
# 1. Verificar estado
pwd && git status && git branch

# 2. Testar build
pnpm build

# 3. Commit
git add . && git commit -m "[MENSAGEM PADRONIZADA]"

# 4. Push
git push origin develop

# 5. Deploy
vercel --prod

# 6. Verificar URL de produção
```

## 📚 **LINKS ÚTEIS**

- **Repositório:** https://github.com/guigonzalez/mesarpg-dev
- **Vercel Dashboard:** https://vercel.com/guiperezgo/mesarpg
- **Produção Atual:** https://mesarpg-ggnu458x6-guiperezgo.vercel.app

---

**💡 Dica:** Sempre seguir este guia para manter consistência e qualidade nos commits e deploys!

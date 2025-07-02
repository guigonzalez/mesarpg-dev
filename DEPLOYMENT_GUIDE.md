# 🚀 Guia de Deploy - MesaRPG

## 📋 Pré-requisitos

- [x] Repositório GitHub configurado
- [x] Projeto Next.js funcionando
- [x] Supabase configurado
- [x] Vercel CLI instalado

## 🎯 Estratégia de Deploy

### **Ambientes**
```
┌─────────────────┬──────────────────┬─────────────────────────────┐
│ Branch          │ Ambiente         │ URL                         │
├─────────────────┼──────────────────┼─────────────────────────────┤
│ main            │ Produção         │ mesarpg-dev.vercel.app      │
│ develop         │ Staging          │ mesarpg-dev-git-develop...  │
│ feature/*       │ Preview          │ mesarpg-dev-git-feature...  │
└─────────────────┴──────────────────┴─────────────────────────────┘
```

### **Fluxo de Deploy**
```
1. Desenvolvimento → feature/nova-funcionalidade
2. Pull Request → develop (Preview Deploy)
3. Merge → develop (Staging Deploy)
4. Pull Request → main (Preview Deploy)
5. Merge → main (Production Deploy)
```

## 🔧 Configuração Vercel

### **1. Conectar Repositório**
```bash
# Fazer login na Vercel
vercel login

# Conectar projeto
cd /path/to/mesarpg-dev
vercel
```

### **2. Configurações do Projeto**
```
Project Name: mesarpg-dev
Framework: Next.js
Root Directory: ./
Build Command: pnpm build
Install Command: pnpm install
Development Command: pnpm dev
```

### **3. Variáveis de Ambiente**
```env
# Produção (main branch)
NEXT_PUBLIC_SUPABASE_URL=https://qxdzialcrytriofhoknp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXTAUTH_URL=https://mesarpg-dev.vercel.app
NEXTAUTH_SECRET=production-secret-key-2025
NODE_ENV=production

# Staging (develop branch)
NEXT_PUBLIC_SUPABASE_URL=https://qxdzialcrytriofhoknp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXTAUTH_URL=https://mesarpg-dev-git-develop.vercel.app
NEXTAUTH_SECRET=staging-secret-key-2025
NODE_ENV=development
```

## 🌐 Deploy via Dashboard

### **Passo 1: Acessar Vercel**
1. Acesse https://vercel.com
2. Faça login com GitHub
3. Clique em "Add New Project"

### **Passo 2: Importar Repositório**
1. Selecione "Import Git Repository"
2. Escolha `guigonzalez/mesarpg-dev`
3. Clique em "Import"

### **Passo 3: Configurar Projeto**
```
Project Name: mesarpg-dev
Framework Preset: Next.js
Root Directory: ./
Build and Output Settings:
  ✅ Override: No (usar padrões do Next.js)
```

### **Passo 4: Variáveis de Ambiente**
```
Environment Variables:
┌─────────────────────────────────┬─────────────────────────────────┬─────────────┐
│ Name                            │ Value                           │ Environment │
├─────────────────────────────────┼─────────────────────────────────┼─────────────┤
│ NEXT_PUBLIC_SUPABASE_URL        │ https://qxdzialcrytriofhoknp... │ All         │
│ NEXT_PUBLIC_SUPABASE_ANON_KEY   │ eyJhbGciOiJIUzI1NiIsInR5cCI6... │ All         │
│ SUPABASE_SERVICE_ROLE_KEY       │ eyJhbGciOiJIUzI1NiIsInR5cCI6... │ All         │
│ NEXTAUTH_SECRET                 │ production-secret-2025          │ Production  │
│ NEXTAUTH_SECRET                 │ staging-secret-2025             │ Preview     │
│ NODE_ENV                        │ production                      │ Production  │
│ NODE_ENV                        │ development                     │ Preview     │
└─────────────────────────────────┴─────────────────────────────────┴─────────────┘
```

### **Passo 5: Deploy**
1. Clique em "Deploy"
2. Aguarde o build (2-3 minutos)
3. ✅ Deploy concluído!

## 🔄 Deploy via CLI

### **Deploy Inicial**
```bash
cd ../Documents/GitHub/mesarpg-dev

# Login na Vercel
vercel login

# Deploy inicial
vercel

# Seguir prompts:
# ? Set up and deploy "~/Documents/GitHub/mesarpg-dev"? [Y/n] y
# ? Which scope do you want to deploy to? guigonzalez
# ? Link to existing project? [y/N] n
# ? What's your project's name? mesarpg-dev
# ? In which directory is your code located? ./
```

### **Configurar Variáveis**
```bash
# Adicionar variáveis de ambiente
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXTAUTH_SECRET

# Deploy para produção
vercel --prod
```

## 📊 Monitoramento

### **URLs de Acesso**
- **Produção**: https://mesarpg-dev.vercel.app
- **Staging**: https://mesarpg-dev-git-develop.vercel.app
- **Dashboard**: https://vercel.com/guigonzalez/mesarpg-dev

### **Logs e Analytics**
```bash
# Ver logs em tempo real
vercel logs

# Ver deployments
vercel ls

# Ver domínios
vercel domains ls
```

## 🔧 Configurações Avançadas

### **Domínio Customizado**
```bash
# Adicionar domínio personalizado
vercel domains add mesarpg.com.br
vercel domains add www.mesarpg.com.br

# Configurar DNS
# A record: @ → 76.76.19.61
# CNAME: www → cname.vercel-dns.com
```

### **Branch Protection**
```
GitHub Settings → Branches → Add rule:
✅ Require pull request reviews
✅ Require status checks (Vercel)
✅ Require branches to be up to date
✅ Include administrators
```

## 🚨 Troubleshooting

### **Erro de Build**
```bash
# Verificar logs
vercel logs --follow

# Build local
pnpm build

# Verificar variáveis
vercel env ls
```

### **Erro de Supabase**
```bash
# Verificar conexão
curl -H "apikey: YOUR_ANON_KEY" \
     "https://qxdzialcrytriofhoknp.supabase.co/rest/v1/"
```

### **Erro de Autenticação**
```bash
# Verificar NEXTAUTH_URL
echo $NEXTAUTH_URL

# Deve ser: https://mesarpg-dev.vercel.app (produção)
```

## ✅ Checklist de Deploy

### **Antes do Deploy**
- [ ] Código commitado e pushed
- [ ] Testes locais passando
- [ ] Variáveis de ambiente configuradas
- [ ] Schema do Supabase aplicado

### **Após o Deploy**
- [ ] Site acessível na URL
- [ ] Login funcionando
- [ ] Supabase conectado
- [ ] Real-time funcionando
- [ ] Performance OK (< 3s)

## 🎯 Próximos Passos

1. **Deploy Inicial** ✅
2. **Configurar Staging** 
3. **Testes de Integração**
4. **Configurar Domínio**
5. **Monitoramento**

---

**Última atualização**: 02/07/2025
**Status**: Pronto para deploy 🚀

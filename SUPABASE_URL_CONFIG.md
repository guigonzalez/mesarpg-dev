# Configurar URL de Produção no Supabase

## Problema
O email de confirmação está vindo com link para `localhost:3000` em vez da URL de produção.

## Solução

### 1. Acessar o Painel do Supabase
1. Vá para: https://supabase.com/dashboard
2. Acesse seu projeto: `qxdzialcrytriofhoknp`

### 2. Configurar Site URL
1. No painel lateral, clique em **"Authentication"**
2. Clique em **"URL Configuration"**
3. Configure os seguintes campos:

**Site URL:**
```
https://mesarpg-qvh3la5yk-guiperezgo.vercel.app
```

**Redirect URLs (adicionar todas):**
```
https://mesarpg-qvh3la5yk-guiperezgo.vercel.app/auth/callback
https://mesarpg-qvh3la5yk-guiperezgo.vercel.app/login
https://mesarpg-qvh3la5yk-guiperezgo.vercel.app/dashboard
http://localhost:3000/auth/callback
http://localhost:3000/login
http://localhost:3000/dashboard
```

### 3. Configurar Email Templates
1. Ainda em **"Authentication"**, clique em **"Email Templates"**
2. Edite o template **"Confirm signup"**
3. Certifique-se que a URL de confirmação usa: `{{ .SiteURL }}`

### 4. Salvar e Testar
1. Clique em **"Save"** em todas as configurações
2. Aguarde alguns minutos para propagar
3. Teste criando um novo usuário

## URLs Atuais do Projeto
- **Produção**: https://mesarpg-qvh3la5yk-guiperezgo.vercel.app
- **Desenvolvimento**: http://localhost:3000

## Após Configurar
- ✅ Emails de confirmação usarão a URL de produção
- ✅ Redirects funcionarão corretamente
- ✅ Sistema funcionará tanto em dev quanto em prod

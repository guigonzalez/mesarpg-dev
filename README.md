# MesaRPG - Plataforma de RPG Online

Uma plataforma web moderna para jogos de RPG de mesa online, desenvolvida com Next.js, TypeScript e Supabase.

## 🎯 Sobre o Projeto

MesaRPG é uma aplicação completa para facilitar sessões de RPG online, oferecendo:

- **Sistema de Campanhas**: Criação e gerenciamento de campanhas de RPG
- **Fichas Personalizáveis**: Sistema flexível de fichas para diferentes sistemas de RPG
- **Mapas Interativos**: Grid com tokens, fog of war e ferramentas de desenho
- **Chat em Tempo Real**: Comunicação durante as sessões
- **Gestão de NPCs**: Criação e gerenciamento de personagens não-jogadores
- **Handouts**: Compartilhamento de documentos e imagens
- **Roles Diferenciados**: Interfaces específicas para Mestres e Jogadores

## 🚀 Tecnologias

### Frontend
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **shadcn/ui** - Componentes UI baseados em Radix UI
- **Zustand** - Gerenciamento de estado (migração para Supabase em andamento)

### Backend & Infraestrutura
- **Supabase** - Backend as a Service (BaaS)
- **PostgreSQL** - Banco de dados relacional
- **Vercel** - Deploy e CI/CD
- **GitHub** - Versionamento e colaboração

### Bibliotecas Principais
- **@dnd-kit** - Drag and drop para tokens
- **React Hook Form + Zod** - Formulários e validação
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones

## 🏗️ Arquitetura do Projeto

```
mesarpg-dev/
├── app/                    # App Router (Next.js 13+)
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx           # Redirect para login
│   ├── login/             # Página de autenticação
│   ├── dashboard/         # Dashboard principal
│   └── campanhas/         # Páginas das campanhas
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── rpg/              # Componentes específicos do RPG
│   ├── dashboard/        # Componentes do dashboard
│   └── master-view/      # Componentes da visão do mestre
├── lib/                  # Utilitários e configurações
│   ├── types.ts          # Definições de tipos TypeScript
│   ├── store.ts          # Store Zustand (temporário)
│   ├── utils.ts          # Funções utilitárias
│   └── mocks.ts          # Dados mocados (temporário)
├── hooks/                # Custom hooks
└── public/               # Assets estáticos
```

## 🎮 Sistemas de RPG Suportados

- **D&D 5e** - Dungeons & Dragons 5ª Edição
- **Vampiro: A Máscara** - World of Darkness
- **Sistema Livre** - Fichas customizáveis

## 🔧 Configuração de Desenvolvimento

### Pré-requisitos
- Node.js 18+
- pnpm (recomendado)
- Conta no Supabase
- Conta no Vercel (para deploy)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/[seu-usuario]/mesarpg-dev.git
cd mesarpg-dev
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Execute o servidor de desenvolvimento:
```bash
pnpm dev
```

5. Acesse http://localhost:3000

### Credenciais de Teste (Dados Mocados)
- **Mestre**: `mestre@mesarpg.com` / `123`
- **Jogador**: `jogador@mesarpg.com` / `123`

## 🌿 Fluxo de Desenvolvimento

### Branches
- `main` - Produção (deploy automático)
- `develop` - Desenvolvimento (staging)
- `feature/*` - Features específicas

### Workflow
1. Crie uma branch feature: `git checkout -b feature/nova-funcionalidade`
2. Desenvolva e teste localmente
3. Faça commit das mudanças
4. Abra Pull Request para `develop`
5. Após aprovação, merge para `develop` (deploy staging)
6. Teste no ambiente de staging
7. Merge para `main` (deploy produção)

## 🚀 Deploy

### Staging (develop)
- URL: https://mesarpg-dev-staging.vercel.app
- Deploy automático a cada push na branch `develop`

### Produção (main)
- URL: https://mesarpg.vercel.app
- Deploy automático a cada push na branch `main`

## 📊 Roadmap de Migração

### ✅ Fase 1: Infraestrutura
- [x] Configuração do repositório GitHub
- [x] Setup inicial do projeto
- [ ] Configuração do Supabase
- [ ] Configuração da Vercel

### 🔄 Fase 2: Backend (Em Andamento)
- [ ] Schema do banco de dados
- [ ] Configuração do cliente Supabase
- [ ] Migração da autenticação
- [ ] Sistema de tempo real

### 📋 Fase 3: Features
- [ ] CRUD completo de campanhas
- [ ] Sistema de convites
- [ ] Gestão de permissões
- [ ] Chat em tempo real

### 🎯 Fase 4: Otimizações
- [ ] Performance e cache
- [ ] Melhorias de UX/UI
- [ ] Monitoramento e analytics

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

- GitHub: [@[seu-usuario]](https://github.com/[seu-usuario])
- Email: [seu-email]

---

**MesaRPG** - Transformando a experiência de RPG online 🎲✨

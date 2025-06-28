# 🦷 Odonto App - Sistema de Gestão Odontológica

Sistema completo para gestão de consultório odontológico, desenvolvido com **Node.js** (backend) e **React** (frontend), preparado para deploy na web e uso como PWA no celular.

## 🚀 Arquitetura

- **Frontend**: React + Vite + PWA (hospedado no Vercel)
- **Backend**: Node.js + Express + MongoDB (hospedado no Railway)
- **Banco de Dados**: MongoDB Atlas
- **Autenticação**: JWT (JSON Web Tokens)

## 📱 Funcionalidades Atuais

✅ **Implementado:**
- Sistema de autenticação (login/registro)
- Teste de conexão entre frontend e backend
- Dashboard responsivo com design profissional
- PWA (Progressive Web App) para instalação no celular
- Diferentes níveis de usuário (admin, dentista, secretária)

🔄 **Em Desenvolvimento:**
- Gestão de pacientes
- Sistema de agendamento
- Controle financeiro
- Relatórios e estatísticas

## 🛠️ Configuração Local

### Pré-requisitos
- Node.js 18+ instalado
- Git instalado
- Conta no MongoDB Atlas (gratuita)

### 1. Clonar e Configurar o Backend

```bash
# Navegar para o backend
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Editar o arquivo .env com suas configurações:
# - MONGODB_URI: String de conexão do MongoDB Atlas
# - JWT_SECRET: Chave secreta para tokens (substitua por uma segura)
# - PORT: 3001 (padrão)

# Executar em desenvolvimento
npm run dev
```

### 2. Configurar o Frontend

```bash
# Em outro terminal, navegar para o frontend
cd frontend

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

### 3. Acessar o Sistema

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Teste de Status**: http://localhost:3001/api/status

## 🌐 Deploy para Produção

### Backend no Railway

1. **Criar conta no Railway**: https://railway.app
2. **Instalar Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

3. **Deploy do Backend**:
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

4. **Configurar Variáveis de Ambiente no Railway**:
   - `MONGODB_URI`: URI do MongoDB Atlas
   - `JWT_SECRET`: Chave secreta segura
   - `NODE_ENV`: production
   - `FRONTEND_URL`: URL do frontend no Vercel

### Frontend no Vercel

1. **Criar conta no Vercel**: https://vercel.com
2. **Instalar Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

3. **Deploy do Frontend**:
   ```bash
   cd frontend
   vercel login
   npm run build
   vercel
   ```

4. **Configurar Environment Variables no Vercel**:
   - `VITE_API_URL`: URL do backend no Railway

## 📱 Instalação como PWA no iPhone

1. **Acessar via Safari**: Abra a URL do Vercel no Safari do iPhone
2. **Compartilhar**: Toque no ícone de compartilhamento (quadrado com seta)
3. **Adicionar à Tela de Início**: Role para baixo e toque em "Adicionar à Tela de Início"
4. **Confirmar**: Digite o nome desejado e toque em "Adicionar"

O app ficará disponível na tela inicial como um aplicativo nativo!

## 🔧 Scripts Disponíveis

### Backend
```bash
npm run dev      # Executar em desenvolvimento com nodemon
npm start        # Executar em produção
```

### Frontend
```bash
npm run dev      # Executar em desenvolvimento
npm run build    # Gerar build de produção
npm run preview  # Visualizar build localmente
```

## 📁 Estrutura do Projeto

```
odonto-app/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── controllers/     # Lógica de negócio
│   │   ├── models/         # Modelos do banco de dados
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Middlewares (auth, etc.)
│   │   ├── config/         # Configurações (DB, etc.)
│   │   └── app.js         # Configuração do Express
│   ├── .env               # Variáveis de ambiente
│   ├── server.js          # Entrada da aplicação
│   └── railway.json       # Configuração do Railway
│
├── frontend/               # App React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── services/     # Comunicação com API
│   │   ├── context/      # Context API (auth, etc.)
│   │   └── assets/       # Imagens, ícones, etc.
│   ├── public/           # Arquivos públicos
│   │   └── manifest.json # Configuração PWA
│   └── vite.config.js    # Configuração do Vite
│
└── README.md             # Este arquivo
```

## 🔐 Sistema de Autenticação

### Registrar Novo Usuário
```javascript
// Endpoint: POST /api/auth/register
{
  "name": "Dr. João Silva",
  "email": "joao@clinica.com",
  "password": "senha123456",
  "role": "admin" // admin | dentista | secretaria
}
```

### Fazer Login
```javascript
// Endpoint: POST /api/auth/login
{
  "email": "joao@clinica.com",
  "password": "senha123456"
}
```

## 🔄 Próximos Passos para Desenvolvimento

### 1. Gestão de Pacientes
- Cadastro completo de pacientes
- Histórico médico e odontológico
- Upload de exames e radiografias
- Fichas clínicas detalhadas

### 2. Sistema de Agendamento
- Calendário interativo
- Agendamento online para pacientes
- Notificações automáticas (SMS/Email/WhatsApp)
- Controle de disponibilidade

### 3. Módulo Financeiro
- Controle de pagamentos e recebimentos
- Emissão de recibos e notas fiscais
- Relatórios financeiros
- Integração com sistemas de pagamento

### 4. Relatórios e Analytics
- Dashboard com estatísticas
- Relatórios de produtividade
- Análise de faturamento
- Métricas de pacientes

## 🆘 Suporte e Troubleshooting

### Problemas Comuns

**Erro de conexão com API:**
- Verificar se o backend está rodando na porta 3001
- Confirmar variáveis de ambiente
- Verificar configurações de CORS

**Erro no MongoDB:**
- Verificar string de conexão no .env
- Confirmar se o IP está liberado no MongoDB Atlas
- Verificar se o cluster está ativo

**PWA não instala no iPhone:**
- Usar obrigatoriamente o Safari
- Certificar que está acessando via HTTPS em produção
- Verificar se o manifest.json está configurado corretamente

## 📄 Licença

Este projeto foi desenvolvido para uso em consultórios odontológicos. Todos os direitos reservados.

---

## 🔗 Links Úteis

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)

---

**Desenvolvido com ❤️ para facilitar a gestão de consultórios odontológicos**

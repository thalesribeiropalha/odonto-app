# Sistema de Gestão Odontológica

Sistema completo para gestão de clínicas odontológicas com autenticação, gestão de usuários e organizações.

## 🔧 Tecnologias

### Backend
- **Node.js** + Express
- **Supabase** (PostgreSQL) - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas

### Frontend
- **React** + Vite
- **Axios** - Requisições HTTP
- **CSS Modules** - Estilização

## 🚀 Configuração

### 1. Backend

```bash
cd backend
npm install
```

#### Variáveis de Ambiente
Crie um arquivo `.env` baseado no `.env.example`:

```env
# Configurações do Servidor
PORT=3002
NODE_ENV=development

# JWT Secret
JWT_SECRET=your-jwt-secret-key-here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:5173
```

#### Configuração do Banco de Dados
1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o SQL em `backend/src/config/create-tables.sql` no SQL Editor do Supabase
3. Configure as variáveis de ambiente com suas credenciais

### 2. Frontend

```bash
cd frontend
npm install
```

#### Variáveis de Ambiente
Crie um arquivo `.env` no frontend:

```env
VITE_API_URL=http://localhost:3002
```

## 🏃‍♂️ Executando

### Desenvolvimento

```bash
# Backend
cd backend
npm run dev

# Frontend (em outro terminal)
cd frontend
npm run dev
```

### Produção

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
```

## 📊 Estrutura do Banco

### Tabelas

#### `organizations`
- Dados das clínicas/organizações
- Configurações e assinaturas
- Endereços e contatos

#### `users`
- Usuários do sistema
- Roles: owner, admin, dentist, secretary
- Permissões granulares
- Vinculação com organizações

## 🔐 Autenticação

Sistema baseado em JWT com:
- Login/registro de usuários
- Middleware de proteção de rotas
- Verificação de permissões por role
- Tokens com expiração de 14 dias

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   ├── supabase.js          # Configuração Supabase
│   │   └── create-tables.sql    # SQL de criação das tabelas
│   ├── controllers/             # Lógica de negócio
│   ├── middleware/             # Middlewares (auth, etc.)
│   └── routes/                 # Definição das rotas
├── server.js                   # Entrada da aplicação
└── package.json

frontend/
├── src/
│   ├── components/             # Componentes React
│   ├── pages/                  # Páginas da aplicação
│   ├── services/              # Serviços (API calls)
│   └── context/               # Context API (Auth)
├── index.html
└── package.json
```

## 🌐 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro simples
- `POST /api/auth/register-organization` - Registro com organização
- `GET /api/auth/profile` - Perfil do usuário
- `GET /api/auth/verify` - Verificar token

### Usuários
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `GET /api/users/:id` - Obter usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Organizações
- `GET /api/organizations` - Listar organizações
- `POST /api/organizations` - Criar organização
- `GET /api/organizations/:id` - Obter organização
- `PUT /api/organizations/:id` - Atualizar organização

### Teste
- `GET /api/status` - Status da API
- `GET /api/test-supabase` - Testar conexão Supabase

## 🔄 Migração MongoDB → Supabase

Este projeto foi migrado do MongoDB para Supabase. As principais mudanças:

### ✅ Implementado
- ✅ Configuração completa do Supabase
- ✅ Todos os controllers migrados
- ✅ Middleware de autenticação atualizado
- ✅ Estrutura de tabelas PostgreSQL
- ✅ Variáveis de ambiente configuradas
- ✅ Limpeza de código legado

### 🗑️ Removido
- ❌ Dependência do mongoose
- ❌ Models do Mongoose
- ❌ Configuração do MongoDB
- ❌ Arquivos duplicados (*-supabase.js)

## 🚨 Notas Importantes

1. **Banco de Dados**: Execute o SQL em `create-tables.sql` no Supabase
2. **Variáveis**: Configure todas as variáveis de ambiente
3. **Credenciais**: Nunca commite credenciais no código
4. **CORS**: Frontend URL deve estar configurada no backend

## 📝 Licença

ISC License - Thales Ribeiro

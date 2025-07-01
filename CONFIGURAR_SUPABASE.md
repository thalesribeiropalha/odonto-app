# 🗄️ Configurar Banco de Dados no Supabase

## ✅ **VOCÊ JÁ TEM:**
- Backend funcionando ✅
- Conexão com Supabase configurada ✅

## 📋 **AGORA FAÇA:**

### 1. **Acesse o Supabase Dashboard**
```
https://supabase.com/dashboard
```

### 2. **Abra Seu Projeto**
- Procure pelo projeto: **ahnygfwpzuierxsitore**
- Clique para abrir

### 3. **Vá para SQL Editor**
- No menu lateral, clique em **"SQL Editor"**
- Ou procure por **"Query"** ou **"Database"**

### 4. **Execute o SQL**

Copie TODO o conteúdo do arquivo `backend/src/config/create-tables.sql` e cole no editor:

```sql
-- Criar tabela organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  document VARCHAR(20),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  subscription JSONB DEFAULT '{}',
  created_by UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'dentist', 'secretary')),
  permissions TEXT[] DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  profile JSONB DEFAULT '{}',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON organizations(is_active);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Inserir dados de exemplo
INSERT INTO organizations (name, slug, email, subscription) 
VALUES (
  'Clínica Odonto Demo',
  'clinica-odonto-demo',
  'contato@clinicademo.com',
  '{"plan": "starter", "maxUsers": 5, "maxPatients": 100, "isActive": true, "expiresAt": "2025-12-31T23:59:59Z"}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Inserir usuário admin de exemplo (senha: admin123)
INSERT INTO users (name, email, password, organization_id, role, permissions, profile)
SELECT 
  'Admin Sistema',
  'admin@clinicademo.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  o.id,
  'admin',
  ARRAY['users.create', 'users.read', 'users.update', 'users.delete', 'organization.manage'],
  '{"cro": "", "specialty": "Administração"}'::jsonb
FROM organizations o 
WHERE o.slug = 'clinica-odonto-demo'
ON CONFLICT (email) DO NOTHING;
```

### 5. **Clique em "Run" ou "Execute"**
- Após colar todo o SQL acima
- Clique no botão **"Run"** ou **"Execute"**
- Aguarde a execução

### 6. **Teste se Funcionou**

Após executar o SQL, teste esta URL:

```
https://odonto-app-production.up.railway.app/api/test-supabase/data
```

**Deve retornar:** Dados da organização e usuário demo

## ✅ **CREDENCIAIS DE TESTE:**
- **Email:** admin@clinicademo.com
- **Senha:** admin123

## 🚀 **PRÓXIMO PASSO:**
Após executar o SQL, me diga se funcionou!

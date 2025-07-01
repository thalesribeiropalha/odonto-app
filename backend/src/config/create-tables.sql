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
  '$2b$10$rOzJqKcFvqVrQJGHGXxO4.WuJGkNJGHxFvqVrQJGHGXxO4.WuJGkNJ', -- Hash de 'admin123'
  o.id,
  'admin',
  ARRAY['users.create', 'users.read', 'users.update', 'users.delete', 'organization.manage'],
  '{"cro": "", "specialty": "Administração"}'::jsonb
FROM organizations o 
WHERE o.slug = 'clinica-odonto-demo'
ON CONFLICT (email) DO NOTHING;

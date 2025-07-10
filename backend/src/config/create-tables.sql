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

-- === TABELA DE PACIENTES ===

-- Criar tabela patients
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Informações básicas
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  document VARCHAR(20), -- CPF sem formatação (apenas números)
  birth_date DATE,
  gender VARCHAR(10) CHECK (gender IN ('masculino', 'feminino', 'outro')),
  
  -- Endereço (JSONB para flexibilidade)
  address JSONB DEFAULT '{
    "cep": "",
    "street": "", 
    "number": "",
    "complement": "",
    "neighborhood": "",
    "city": "",
    "state": ""
  }'::jsonb,
  
  -- Informações médicas
  medical_info JSONB DEFAULT '{
    "allergies": [],
    "medications": [],
    "medical_conditions": [],
    "medical_history": "",
    "blood_type": "",
    "insurance": {
      "provider": "",
      "number": "",
      "expires_at": null
    }
  }'::jsonb,
  
  -- Contato de emergência
  emergency_contact JSONB DEFAULT '{
    "name": "",
    "phone": "",
    "relationship": "",
    "address": ""
  }'::jsonb,
  
  -- Observações gerais
  notes TEXT,
  
  -- Controle de sistema
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices essenciais para performance
CREATE INDEX IF NOT EXISTS idx_patients_organization_id ON patients(organization_id);
CREATE INDEX IF NOT EXISTS idx_patients_document ON patients(document) WHERE document IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients USING gin(to_tsvector('portuguese', name));
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone) WHERE phone IS NOT NULL;

-- Índices compostos para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_patients_org_active ON patients(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_patients_org_created ON patients(organization_id, created_at DESC);

-- Índice para busca em JSONB (endereço)
CREATE INDEX IF NOT EXISTS idx_patients_address_city ON patients USING gin((address->'city'));

-- Constraint para documento único por organização
ALTER TABLE patients 
ADD CONSTRAINT IF NOT EXISTS unique_document_per_org 
UNIQUE (organization_id, document) 
DEFERRABLE INITIALLY DEFERRED;

-- Constraint para email único por organização (se informado)
CREATE UNIQUE INDEX IF NOT EXISTS unique_email_per_org 
ON patients(organization_id, email) 
WHERE email IS NOT NULL AND email != '';

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_patients_updated_at 
    BEFORE UPDATE ON patients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de exemplo para desenvolvimento
INSERT INTO patients (
  organization_id, 
  name, 
  email, 
  phone, 
  document, 
  birth_date, 
  gender,
  address,
  medical_info,
  emergency_contact,
  created_by
) 
SELECT 
  o.id,
  'João Silva',
  'joao.silva@email.com',
  '11987654321',
  '12345678901',
  '1985-03-15',
  'masculino',
  '{
    "cep": "01310-100",
    "street": "Avenida Paulista",
    "number": "1000",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP"
  }'::jsonb,
  '{
    "allergies": ["Penicilina"],
    "medications": [],
    "medical_conditions": ["Hipertensão"],
    "blood_type": "O+",
    "medical_history": "Paciente com histórico de hipertensão controlada."
  }'::jsonb,
  '{
    "name": "Maria Silva",
    "phone": "11987654322",
    "relationship": "Esposa"
  }'::jsonb,
  u.id
FROM organizations o, users u 
WHERE o.slug = 'clinica-odonto-demo' 
  AND u.email = 'admin@clinicademo.com'
ON CONFLICT (organization_id, document) DO NOTHING;

-- Inserir mais pacientes de exemplo
INSERT INTO patients (
  organization_id, 
  name, 
  phone, 
  document, 
  birth_date, 
  gender,
  address,
  medical_info,
  created_by
) 
SELECT 
  o.id,
  'Ana Santos',
  '11998877665',
  '98765432109',
  '1992-07-22',
  'feminino',
  '{
    "cep": "04038-001",
    "street": "Rua Vergueiro",
    "number": "2000",
    "neighborhood": "Vila Mariana",
    "city": "São Paulo",
    "state": "SP"
  }'::jsonb,
  '{
    "allergies": [],
    "medications": ["Vitamina D"],
    "medical_conditions": [],
    "blood_type": "A+",
    "medical_history": "Paciente sem histórico médico relevante."
  }'::jsonb,
  u.id
FROM organizations o, users u 
WHERE o.slug = 'clinica-odonto-demo' 
  AND u.email = 'admin@clinicademo.com'
ON CONFLICT (organization_id, document) DO NOTHING;

INSERT INTO patients (
  organization_id, 
  name, 
  phone, 
  document, 
  birth_date, 
  gender,
  notes,
  created_by
) 
SELECT 
  o.id,
  'Carlos Oliveira',
  '11955443322',
  '11122233344',
  '1978-12-10',
  'masculino',
  'Paciente prefere atendimento no período da manhã.',
  u.id
FROM organizations o, users u 
WHERE o.slug = 'clinica-odonto-demo' 
  AND u.email = 'admin@clinicademo.com'
ON CONFLICT (organization_id, document) DO NOTHING;


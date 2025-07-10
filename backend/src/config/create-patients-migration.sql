-- Migração para criação da tabela de pacientes
-- Execute este script no Supabase SQL Editor

BEGIN;

-- Verificar se a tabela já existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' 
                   AND table_name = 'patients') THEN
        
        -- Criar tabela patients
        CREATE TABLE patients (
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
        CREATE INDEX idx_patients_organization_id ON patients(organization_id);
        CREATE INDEX idx_patients_document ON patients(document) WHERE document IS NOT NULL;
        CREATE INDEX idx_patients_email ON patients(email) WHERE email IS NOT NULL;
        CREATE INDEX idx_patients_name ON patients USING gin(to_tsvector('portuguese', name));
        CREATE INDEX idx_patients_phone ON patients(phone) WHERE phone IS NOT NULL;

        -- Índices compostos para consultas frequentes
        CREATE INDEX idx_patients_org_active ON patients(organization_id, is_active);
        CREATE INDEX idx_patients_org_created ON patients(organization_id, created_at DESC);

        -- Índice para busca em JSONB (endereço)
        CREATE INDEX idx_patients_address_city ON patients USING gin((address->'city'));

        -- Constraint para documento único por organização
        ALTER TABLE patients 
        ADD CONSTRAINT unique_document_per_org 
        UNIQUE (organization_id, document) 
        DEFERRABLE INITIALLY DEFERRED;

        -- Constraint para email único por organização (se informado)
        CREATE UNIQUE INDEX unique_email_per_org 
        ON patients(organization_id, email) 
        WHERE email IS NOT NULL AND email != '';

        -- Trigger para atualizar updated_at automaticamente
        CREATE OR REPLACE FUNCTION update_patients_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_patients_updated_at_trigger
            BEFORE UPDATE ON patients 
            FOR EACH ROW 
            EXECUTE FUNCTION update_patients_updated_at();

        RAISE NOTICE 'Tabela patients criada com sucesso!';
        
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
          AND u.email = 'admin@clinicademo.com';

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
          AND u.email = 'admin@clinicademo.com';

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
          AND u.email = 'admin@clinicademo.com';

        RAISE NOTICE 'Dados de exemplo inseridos com sucesso!';
        
    ELSE
        RAISE NOTICE 'Tabela patients já existe, pulando criação.';
    END IF;
END $$;

COMMIT;

-- Verificar se a criação foi bem-sucedida
SELECT 
  'patients' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN is_active THEN 1 END) as registros_ativos
FROM patients;

-- Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'patients'
ORDER BY ordinal_position;


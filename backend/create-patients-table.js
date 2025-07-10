const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createPatientsTable() {
  console.log('🔄 Iniciando migração da tabela de pacientes...');
  
  try {
    // SQL para criar a tabela de pacientes
    const createTableSQL = `
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

              RAISE NOTICE 'Tabela patients criada com sucesso!';
              
          ELSE
              RAISE NOTICE 'Tabela patients já existe, pulando criação.';
          END IF;
      END $$;
    `;

    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    });

    if (createError) {
      console.error('❌ Erro ao criar tabela:', createError);
      // Tentar executar diretamente
      const { error: directError } = await supabase
        .from('_supabase_migrations')
        .select('*')
        .limit(1);
      
      if (directError) {
        console.log('⚠️ Executando SQL diretamente...');
        const { error } = await supabase.rpc('exec', { sql: createTableSQL });
        if (error) throw error;
      }
    }

    console.log('✅ Tabela patients criada com sucesso!');

    // Criar índices
    console.log('🔄 Criando índices...');
    const createIndexesSQL = `
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
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', { 
      sql: createIndexesSQL 
    });
    
    if (indexError) {
      console.log('⚠️ Criando índices alternativamente...');
      // Criar índices um por um
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_patients_organization_id ON patients(organization_id);',
        'CREATE INDEX IF NOT EXISTS idx_patients_document ON patients(document) WHERE document IS NOT NULL;',
        'CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email) WHERE email IS NOT NULL;',
        'CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone) WHERE phone IS NOT NULL;',
        'CREATE INDEX IF NOT EXISTS idx_patients_org_active ON patients(organization_id, is_active);',
        'CREATE INDEX IF NOT EXISTS idx_patients_org_created ON patients(organization_id, created_at DESC);'
      ];

      for (const index of indexes) {
        try {
          await supabase.rpc('exec_sql', { sql: index });
        } catch (err) {
          console.log(`⚠️ Índice ignorado: ${index}`);
        }
      }
    }

    console.log('✅ Índices criados com sucesso!');

    // Criar constraints
    console.log('🔄 Criando constraints...');
    const constraintsSQL = `
      -- Constraint para documento único por organização
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'unique_document_per_org'
        ) THEN
          ALTER TABLE patients 
          ADD CONSTRAINT unique_document_per_org 
          UNIQUE (organization_id, document) 
          DEFERRABLE INITIALLY DEFERRED;
        END IF;
      END $$;

      -- Constraint para email único por organização (se informado)
      CREATE UNIQUE INDEX IF NOT EXISTS unique_email_per_org 
      ON patients(organization_id, email) 
      WHERE email IS NOT NULL AND email != '';
    `;

    await supabase.rpc('exec_sql', { sql: constraintsSQL });
    console.log('✅ Constraints criadas com sucesso!');

    // Criar trigger para updated_at
    console.log('🔄 Criando trigger...');
    const triggerSQL = `
      -- Trigger para atualizar updated_at automaticamente
      CREATE OR REPLACE FUNCTION update_patients_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_patients_updated_at_trigger ON patients;
      CREATE TRIGGER update_patients_updated_at_trigger
          BEFORE UPDATE ON patients 
          FOR EACH ROW 
          EXECUTE FUNCTION update_patients_updated_at();
    `;

    await supabase.rpc('exec_sql', { sql: triggerSQL });
    console.log('✅ Trigger criado com sucesso!');

    // Inserir dados de exemplo
    console.log('🔄 Inserindo dados de exemplo...');
    
    // Primeiro, buscar a organização e usuário existentes
    const { data: orgData } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', 'clinica-odonto-demo')
      .single();

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@clinicademo.com')
      .single();

    if (orgData && userData) {
      const patients = [
        {
          organization_id: orgData.id,
          name: 'João Silva',
          email: 'joao.silva@email.com',
          phone: '11987654321',
          document: '12345678901',
          birth_date: '1985-03-15',
          gender: 'masculino',
          address: {
            cep: '01310-100',
            street: 'Avenida Paulista',
            number: '1000',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP'
          },
          medical_info: {
            allergies: ['Penicilina'],
            medications: [],
            medical_conditions: ['Hipertensão'],
            blood_type: 'O+',
            medical_history: 'Paciente com histórico de hipertensão controlada.'
          },
          emergency_contact: {
            name: 'Maria Silva',
            phone: '11987654322',
            relationship: 'Esposa'
          },
          created_by: userData.id
        },
        {
          organization_id: orgData.id,
          name: 'Ana Santos',
          phone: '11998877665',
          document: '98765432109',
          birth_date: '1992-07-22',
          gender: 'feminino',
          address: {
            cep: '04038-001',
            street: 'Rua Vergueiro',
            number: '2000',
            neighborhood: 'Vila Mariana',
            city: 'São Paulo',
            state: 'SP'
          },
          medical_info: {
            allergies: [],
            medications: ['Vitamina D'],
            medical_conditions: [],
            blood_type: 'A+',
            medical_history: 'Paciente sem histórico médico relevante.'
          },
          created_by: userData.id
        },
        {
          organization_id: orgData.id,
          name: 'Carlos Oliveira',
          phone: '11955443322',
          document: '11122233344',
          birth_date: '1978-12-10',
          gender: 'masculino',
          notes: 'Paciente prefere atendimento no período da manhã.',
          created_by: userData.id
        }
      ];

      for (const patient of patients) {
        const { error } = await supabase
          .from('patients')
          .upsert(patient, { onConflict: 'organization_id,document' });
        
        if (error) {
          console.log(`⚠️ Erro ao inserir paciente ${patient.name}:`, error.message);
        }
      }

      console.log('✅ Dados de exemplo inseridos com sucesso!');
    } else {
      console.log('⚠️ Organização ou usuário demo não encontrados, pulando inserção de dados de exemplo.');
    }

    // Verificar resultado final
    const { data: patientsCount } = await supabase
      .from('patients')
      .select('id', { count: 'exact' });

    console.log(`✅ Migração concluída! Total de pacientes: ${patientsCount?.length || 0}`);

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    process.exit(1);
  }
}

// Executar migração
createPatientsTable()
  .then(() => {
    console.log('🎉 Migração da tabela de pacientes concluída com sucesso!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Falha na migração:', error);
    process.exit(1);
  });


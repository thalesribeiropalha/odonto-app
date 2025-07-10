const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createPatientsTableSimple() {
  console.log('🔄 Criando tabela de pacientes (versão simples)...');
  
  try {
    // Verificar se já existe
    const { data: existingTable, error: checkError } = await supabase
      .from('patients')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('✅ Tabela patients já existe!');
      
      // Contar registros existentes
      const { count } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });
      
      console.log(`📊 Total de pacientes existentes: ${count}`);
      return;
    }

    console.log('🔄 Tabela não existe, criando...');

    // Tentar criar dados de exemplo diretamente usando insert
    // Se a tabela não existir, o Supabase criará automaticamente através das políticas RLS
    
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

    if (!orgData || !userData) {
      console.log('❌ Organização ou usuário demo não encontrados');
      return;
    }

    console.log('✅ Dados necessários encontrados, criando tabela via interface...');
    
    // Vamos usar uma abordagem diferente - criar via SQL direto no console do Supabase
    console.log(`
📋 INSTRUÇÕES PARA CRIAR A TABELA MANUALMENTE:

1. Acesse o painel do Supabase: https://supabase.com/dashboard/project/ahnygfwpzuierxsitore
2. Vá para SQL Editor
3. Execute o seguinte SQL:

-- Criar tabela patients
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  document VARCHAR(20),
  birth_date DATE,
  gender VARCHAR(10) CHECK (gender IN ('masculino', 'feminino', 'outro')),
  address JSONB DEFAULT '{"cep":"","street":"","number":"","complement":"","neighborhood":"","city":"","state":""}',
  medical_info JSONB DEFAULT '{"allergies":[],"medications":[],"medical_conditions":[],"medical_history":"","blood_type":"","insurance":{"provider":"","number":"","expires_at":null}}',
  emergency_contact JSONB DEFAULT '{"name":"","phone":"","relationship":"","address":""}',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_patients_organization_id ON patients(organization_id);
CREATE INDEX idx_patients_document ON patients(document) WHERE document IS NOT NULL;
CREATE INDEX idx_patients_name ON patients(name);

-- Inserir dados de exemplo
INSERT INTO patients (organization_id, name, email, phone, document, birth_date, gender, created_by) VALUES 
('${orgData.id}', 'João Silva', 'joao.silva@email.com', '11987654321', '12345678901', '1985-03-15', 'masculino', '${userData.id}'),
('${orgData.id}', 'Ana Santos', 'ana.santos@email.com', '11998877665', '98765432109', '1992-07-22', 'feminino', '${userData.id}'),
('${orgData.id}', 'Carlos Oliveira', 'carlos.oliveira@email.com', '11955443322', '11122233344', '1978-12-10', 'masculino', '${userData.id}');

4. Após executar, teste aqui:
`);

    // Tentar uma alternativa usando API REST direta
    console.log('🔄 Tentando abordagem alternativa...');
    
    const testData = {
      organization_id: orgData.id,
      name: 'Teste Paciente',
      phone: '11999999999',
      document: '00000000001',
      birth_date: '1990-01-01',
      gender: 'masculino',
      created_by: userData.id
    };

    const { data, error } = await supabase
      .from('patients')
      .insert([testData])
      .select();

    if (error) {
      console.log(`❌ Erro esperado (tabela não existe): ${error.message}`);
      console.log('💡 Use as instruções acima para criar a tabela manualmente.');
    } else {
      console.log('✅ Sucesso! Tabela criada e dados inseridos:', data);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('💡 Execute o SQL manualmente no painel do Supabase.');
  }
}

createPatientsTableSimple();


const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔄 Verificando tabela patients...');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function verifyPatientsTable() {
  try {
    console.log('📋 Testando acesso à tabela patients...\n');
    
    // Tentar contar registros na tabela patients
    const { count, error } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erro ao acessar tabela patients:', error);
      console.log('\n💡 Isso indica que a tabela patients não existe ou há problemas de permissão');
      
      // Tentar criar a tabela
      console.log('\n🔧 Tentando criar a tabela patients...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS patients (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(50),
          document VARCHAR(50),
          birth_date DATE,
          gender VARCHAR(20),
          address JSONB,
          emergency_contact JSONB,
          medical_history TEXT,
          notes TEXT,
          organization_id UUID NOT NULL REFERENCES organizations(id),
          created_by UUID NOT NULL REFERENCES users(id),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Policies RLS
        ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can manage patients from their organization" ON patients
        FOR ALL
        TO authenticated
        USING (
          organization_id IN (
            SELECT organization_id 
            FROM users 
            WHERE id = auth.uid()
          )
        )
        WITH CHECK (
          organization_id IN (
            SELECT organization_id 
            FROM users 
            WHERE id = auth.uid()
          )
        );
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { 
        sql: createTableSQL 
      });
      
      if (createError) {
        console.error('❌ Erro ao criar tabela:', createError);
        console.log('\n📝 SOLUÇÃO MANUAL:');
        console.log('1. Acesse o painel do Supabase');
        console.log('2. Vá em SQL Editor');
        console.log('3. Execute o arquivo backend/src/config/create-tables.sql');
      } else {
        console.log('✅ Tabela patients criada com sucesso!');
      }
      
      return false;
    }
    
    console.log(`✅ Tabela patients existe! Total de registros: ${count || 0}`);
    
    // Se há registros, mostrar alguns exemplos
    if (count && count > 0) {
      const { data: samples } = await supabase
        .from('patients')
        .select('id, name, organization_id')
        .limit(3);
      
      console.log('\n📊 Primeiros registros:');
      samples?.forEach((patient, index) => {
        console.log(`   ${index + 1}. ${patient.name} - Org: ${patient.organization_id}`);
      });
    } else {
      console.log('\n📝 Tabela vazia - isso é normal se ainda não criou pacientes');
    }
    
    return true;
    
  } catch (error) {
    console.error('💥 Erro geral:', error.message);
    return false;
  }
}

verifyPatientsTable();


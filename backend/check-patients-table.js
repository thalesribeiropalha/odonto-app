const { supabaseAdmin } = require('./src/config/supabase');

async function checkPatientsTable() {
  console.log('🔍 Verificando estrutura da tabela patients...\n');
  
  try {
    // 1. Testar acesso direto à tabela patients
    console.log('🧪 Testando consulta na tabela patients...');
    const { count, error: countError } = await supabaseAdmin
      .from('patients')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao consultar tabela patients:', countError);
      
      if (countError.code === 'PGRST116') {
        console.log('\n💡 DIAGNÓSTICO:');
        console.log('   A tabela "patients" não existe no banco de dados');
        console.log('\n🔧 SOLUÇÃO:');
        console.log('   1. Acesse o painel do Supabase');
        console.log('   2. Vá na seção SQL Editor');
        console.log('   3. Execute o arquivo backend/src/config/create-tables.sql');
        console.log('   4. Ou execute o comando: node backend/create-patients-table.js');
      }
      return;
    }
    
    console.log(`✅ Tabela patients existe! Total de registros: ${count || 0}`);
    
    // 2. Testar inserção de dados de teste
    console.log('\n🧪 Testando inserção de dados...');
    const testData = {
      name: 'Paciente Teste Diagnóstico',
      email: 'teste.diagnostico@email.com',
      phone: '(11) 99999-9999',
      document: '000.000.000-00',
      birth_date: '1990-01-01',
      gender: 'masculino',
      address: { street: 'Rua Teste, 123', city: 'São Paulo', state: 'SP' },
      emergency_contact: { name: 'Emergência', phone: '(11) 88888-8888' },
      medical_history: 'Histórico teste',
      notes: 'Nota teste',
      organization_id: '00000000-0000-0000-0000-000000000000',
      created_by: '00000000-0000-0000-0000-000000000000',
      is_active: true
    };
    
    const { data: insertResult, error: insertError } = await supabaseAdmin
      .from('patients')
      .insert([testData])
      .select('id, name')
      .single();
    
    if (insertError) {
      console.error('❌ Erro ao inserir dados de teste:', insertError);
      
      if (insertError.message.includes('medical_history')) {
        console.log('\n💡 DIAGNÓSTICO:');
        console.log('   A tabela patients existe mas com estrutura diferente');
        console.log('   A coluna "medical_history" não foi encontrada');
        console.log('\n🔧 SOLUÇÃO:');
        console.log('   Execute a migração: node backend/create-patients-table.js');
      }
    } else {
      console.log(`✅ Inserção funcionou! ID criado: ${insertResult.id}`);
      
      // Limpar dados de teste
      await supabaseAdmin
        .from('patients')
        .delete()
        .eq('id', insertResult.id);
      console.log('🧹 Dados de teste removidos');
    }
    
    // 3. Verificar alguns dados se existirem
    if (count && count > 0) {
      console.log('\n📊 Primeiros 3 registros existentes:');
      const { data: samples, error: sampleError } = await supabaseAdmin
        .from('patients')
        .select('id, name, organization_id, created_at')
        .limit(3);
      
      if (sampleError) {
        console.error('❌ Erro ao buscar amostras:', sampleError);
      } else {
        samples.forEach((patient, index) => {
          console.log(`   ${index + 1}. ${patient.name} (ID: ${patient.id}) - Org: ${patient.organization_id}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkPatientsTable();



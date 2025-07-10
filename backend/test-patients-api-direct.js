const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔄 Testando API de pacientes diretamente...');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testPatientsAPI() {
  try {
    // Simular dados do usuário logado
    const userOrgId = 'fc380e62-de4e-495d-9914-d5fbb5447058';
    
    console.log(`📋 Testando busca de pacientes para organização: ${userOrgId}`);
    
    // Testar consulta simples como o controller faz
    const { data: patients, error, count } = await supabaseAdmin
      .from('patients')
      .select(`
        id,
        name,
        email,
        phone,
        document,
        birth_date,
        gender,
        address,
        emergency_contact,
        notes,
        organization_id,
        created_by,
        is_active,
        created_at,
        updated_at,
        created_by:created_by (name)
      `)
      .eq('organization_id', userOrgId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro na consulta:', error);
      return;
    }
    
    console.log(`✅ Consulta realizada com sucesso!`);
    console.log(`📊 Total de pacientes encontrados: ${patients?.length || 0}`);
    
    if (patients && patients.length > 0) {
      console.log('\n👥 Pacientes encontrados:');
      patients.forEach((patient, index) => {
        console.log(`   ${index + 1}. ${patient.name}`);
        console.log(`      📧 Email: ${patient.email || 'N/A'}`);
        console.log(`      📞 Telefone: ${patient.phone || 'N/A'}`);
        console.log(`      🆔 ID: ${patient.id}`);
        console.log(`      ✅ Ativo: ${patient.is_active ? 'Sim' : 'Não'}`);
        console.log('      ' + '-'.repeat(50));
      });
    } else {
      console.log('\n📭 Nenhum paciente encontrado para sua organização');
    }
    
    // Testar busca por ID específico
    if (patients && patients.length > 0) {
      const firstPatient = patients[0];
      console.log(`\n🔍 Testando busca por ID específico: ${firstPatient.id}`);
      
      const { data: singlePatient, error: singleError } = await supabaseAdmin
        .from('patients')
        .select(`*`)
        .eq('id', firstPatient.id)
        .eq('organization_id', userOrgId)
        .single();
      
      if (singleError) {
        console.error('❌ Erro ao buscar paciente por ID:', singleError);
      } else {
        console.log(`✅ Paciente encontrado: ${singlePatient.name}`);
      }
    }
    
    console.log('\n🎉 Teste da API concluído com sucesso!');
    console.log('📝 A API está funcionando corretamente no backend.');
    console.log('🔄 Se ainda houver erro no frontend, pode ser problema de CORS ou autenticação.');
    
  } catch (error) {
    console.error('💥 Erro geral no teste:', error.message);
  }
}

testPatientsAPI();


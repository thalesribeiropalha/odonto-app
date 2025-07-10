const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔄 Criando pacientes simples...');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createSimplePatients() {
  try {
    // Dados do seu usuário
    const userEmail = 'dralarissarufino@gmail.com';
    const organizationId = 'fc380e62-de4e-495d-9914-d5fbb5447058';
    const userId = '13cb3351-cc5f-4a24-9220-6b922e2fac7e';
    
    console.log(`📋 Criando pacientes para a organização: ${organizationId}`);
    console.log(`👤 Usuário criador: ${userEmail}`);
    
    // Pacientes com estrutura básica (apenas campos essenciais)
    const simplePatients = [
      {
        name: 'Maria Silva Santos',
        email: 'maria.santos@email.com',
        phone: '(11) 99999-1234',
        document: '123.456.789-01',
        birth_date: '1985-03-15',
        gender: 'feminino',
        organization_id: organizationId,
        created_by: userId,
        is_active: true
      },
      {
        name: 'Pedro Oliveira Costa',
        email: 'pedro.costa@email.com', 
        phone: '(11) 98765-4321',
        document: '987.654.321-09',
        birth_date: '1992-07-22',
        gender: 'masculino',
        organization_id: organizationId,
        created_by: userId,
        is_active: true
      },
      {
        name: 'Ana Beatriz Ferreira',
        email: 'ana.ferreira@email.com',
        phone: '(11) 96666-7890',
        document: '456.789.123-45',
        birth_date: '1978-11-05',
        gender: 'feminino',
        organization_id: organizationId,
        created_by: userId,
        is_active: true
      }
    ];
    
    console.log(`\n🎯 Inserindo ${simplePatients.length} pacientes simples...`);
    
    for (let i = 0; i < simplePatients.length; i++) {
      const patient = simplePatients[i];
      console.log(`\n📝 Criando paciente ${i + 1}: ${patient.name}`);
      
      const { data, error } = await supabase
        .from('patients')
        .insert([patient])
        .select('id, name')
        .single();
      
      if (error) {
        console.error(`❌ Erro ao criar ${patient.name}:`, error);
      } else {
        console.log(`✅ ${patient.name} criado com ID: ${data.id}`);
      }
    }
    
    // Verificar quantos pacientes existem agora para sua organização
    console.log(`\n📊 Verificando pacientes da sua organização...`);
    const { count, error: countError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);
    
    if (countError) {
      console.error('❌ Erro ao contar pacientes:', countError);
    } else {
      console.log(`✅ Total de pacientes na sua organização: ${count}`);
    }
    
    // Mostrar alguns pacientes da sua organização
    console.log(`\n👥 Listando pacientes da sua organização:`);
    const { data: yourPatients, error: listError } = await supabase
      .from('patients')
      .select('id, name, email, phone')
      .eq('organization_id', organizationId)
      .limit(5);
    
    if (listError) {
      console.error('❌ Erro ao listar pacientes:', listError);
    } else {
      yourPatients?.forEach((patient, index) => {
        console.log(`   ${index + 1}. ${patient.name} - ${patient.email} - ${patient.phone}`);
      });
    }
    
    console.log('\n🎉 Pacientes simples criados com sucesso!');
    console.log('🔄 Agora você pode tentar buscar pacientes no frontend.');
    
  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  }
}

createSimplePatients();


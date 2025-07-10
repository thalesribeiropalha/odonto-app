const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔄 Criando pacientes de teste...');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createTestPatients() {
  try {
    // Dados do seu usuário
    const userEmail = 'dralarissarufino@gmail.com';
    const organizationId = 'fc380e62-de4e-495d-9914-d5fbb5447058';
    const userId = '13cb3351-cc5f-4a24-9220-6b922e2fac7e';
    
    console.log(`📋 Criando pacientes para a organização: ${organizationId}`);
    console.log(`👤 Usuário criador: ${userEmail}`);
    
    const testPatients = [
      {
        name: 'Maria Silva Santos',
        email: 'maria.santos@email.com',
        phone: '(11) 99999-1234',
        document: '123.456.789-01',
        birth_date: '1985-03-15',
        gender: 'feminino',
        address: {
          street: 'Rua das Flores, 123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01234-567'
        },
        emergency_contact: {
          name: 'João Santos',
          phone: '(11) 98888-5678',
          relationship: 'Esposo'
        },
        medical_history: 'Sem alergias conhecidas. Histórico de ortodontia.',
        notes: 'Paciente muito colaborativa. Gosta de consultas pela manhã.',
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
        address: {
          street: 'Av. Paulista, 456',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01310-100'
        },
        emergency_contact: {
          name: 'Ana Costa',
          phone: '(11) 97777-1234',
          relationship: 'Mãe'
        },
        medical_history: 'Bruxismo noturno. Usa placa oclusal.',
        notes: 'Prefere consultas no período da tarde devido ao trabalho.',
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
        address: {
          street: 'Rua Augusta, 789',
          neighborhood: 'Consolação',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01305-000'
        },
        emergency_contact: {
          name: 'Carlos Ferreira',
          phone: '(11) 95555-0987',
          relationship: 'Irmão'
        },
        medical_history: 'Periodontite tratada. Manutenção preventiva regular.',
        notes: 'Executiva, agenda muito corrida. Prefere horários flexíveis.',
        organization_id: organizationId,
        created_by: userId,
        is_active: true
      }
    ];
    
    console.log(`\n🎯 Inserindo ${testPatients.length} pacientes de teste...`);
    
    for (let i = 0; i < testPatients.length; i++) {
      const patient = testPatients[i];
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
    
    console.log('\n🎉 Pacientes de teste criados com sucesso!');
    console.log('🔄 Agora você pode tentar buscar pacientes no frontend.');
    
  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  }
}

createTestPatients();


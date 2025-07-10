const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function insertPatientData() {
  console.log('🔄 Inserindo dados de exemplo na tabela patients...');
  
  try {
    // Buscar organização e usuário existentes
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

    console.log('✅ Dados necessários encontrados');
    console.log(`📋 Organização ID: ${orgData.id}`);
    console.log(`👤 Usuário ID: ${userData.id}`);

    // Dados de exemplo para inserir
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
        email: 'ana.santos@email.com',
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
        emergency_contact: {
          name: 'Pedro Santos',
          phone: '11998877666',
          relationship: 'Marido'
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
        address: {
          cep: '05402-000',
          street: 'Rua das Palmeiras',
          number: '500',
          neighborhood: 'Pinheiros',
          city: 'São Paulo',
          state: 'SP'
        },
        medical_info: {
          allergies: ['Látex'],
          medications: [],
          medical_conditions: [],
          blood_type: 'B+',
          medical_history: 'Alergia a látex.'
        },
        notes: 'Paciente prefere atendimento no período da manhã.',
        created_by: userData.id
      }
    ];

    console.log('🔄 Inserindo pacientes...');

    for (const patient of patients) {
      const { data, error } = await supabase
        .from('patients')
        .insert([patient])
        .select();
      
      if (error) {
        console.log(`❌ Erro ao inserir ${patient.name}:`, error.message);
      } else {
        console.log(`✅ Paciente inserido: ${patient.name}`);
      }
    }

    // Verificar resultado final
    const { data: allPatients, count } = await supabase
      .from('patients')
      .select('name, document, phone', { count: 'exact' });

    console.log(`\n📊 RESULTADO FINAL:`);
    console.log(`Total de pacientes: ${count}`);
    console.log('Pacientes cadastrados:');
    allPatients?.forEach((patient, index) => {
      console.log(`${index + 1}. ${patient.name} - CPF: ${patient.document} - Tel: ${patient.phone}`);
    });

    console.log('\n✅ Dados de exemplo inseridos com sucesso!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

insertPatientData();


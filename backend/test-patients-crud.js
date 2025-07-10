const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

// Credenciais do usuário
const loginData = {
  email: 'admin@clinicademo.com',
  password: 'admin123'
};

let authToken = '';
let testPatientId = '';

async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

async function login() {
  console.log('🔐 Fazendo login...');
  
  const result = await makeRequest('POST', '/api/auth/login', loginData);
  
  if (result.success && result.data.token) {
    authToken = result.data.token;
    console.log('✅ Login realizado com sucesso!');
    console.log(`   Token: ${authToken.substring(0, 30)}...`);
    return true;
  } else {
    console.error('❌ Erro no login:', result.error);
    return false;
  }
}

async function testGetPatients() {
  console.log('\n📋 Testando GET /api/patients');
  
  const result = await makeRequest('GET', '/api/patients');
  
  if (result.success) {
    console.log('✅ Busca de pacientes funcionando!');
    console.log(`   Pacientes encontrados: ${result.data.patients?.length || 0}`);
    if (result.data.patients && result.data.patients.length > 0) {
      console.log(`   Primeiro paciente: ${result.data.patients[0].name}`);
    }
  } else {
    console.error('❌ Erro ao buscar pacientes:', result.error);
  }
  
  return result.success;
}

async function testCreatePatient() {
  console.log('\n➕ Testando POST /api/patients');
  
  const newPatient = {
    name: 'Paciente Teste CRUD',
    email: 'teste.crud@email.com',
    phone: '(11) 99999-9999',
    document: '123.456.789-10',
    birth_date: '1990-01-01',
    gender: 'masculino',
    address: {
      street: 'Rua Teste, 123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01000-000'
    },
    emergency_contact: {
      name: 'Contato Emergência',
      phone: '(11) 88888-8888',
      relationship: 'Família'
    },
    notes: 'Paciente criado durante teste de CRUD'
  };
  
  const result = await makeRequest('POST', '/api/patients', newPatient);
  
  if (result.success) {
    testPatientId = result.data.patient.id;
    console.log('✅ Criação de paciente funcionando!');
    console.log(`   ID do paciente criado: ${testPatientId}`);
    console.log(`   Nome: ${result.data.patient.name}`);
  } else {
    console.error('❌ Erro ao criar paciente:', result.error);
  }
  
  return result.success;
}

async function testGetPatientById() {
  if (!testPatientId) {
    console.log('\n⚠️  Pulando teste GET by ID - nenhum paciente criado');
    return false;
  }
  
  console.log(`\n🔍 Testando GET /api/patients/${testPatientId}`);
  
  const result = await makeRequest('GET', `/api/patients/${testPatientId}`);
  
  if (result.success) {
    console.log('✅ Busca de paciente por ID funcionando!');
    console.log(`   Nome: ${result.data.patient.name}`);
    console.log(`   Email: ${result.data.patient.email}`);
  } else {
    console.error('❌ Erro ao buscar paciente por ID:', result.error);
  }
  
  return result.success;
}

async function testUpdatePatient() {
  if (!testPatientId) {
    console.log('\n⚠️  Pulando teste UPDATE - nenhum paciente criado');
    return false;
  }
  
  console.log(`\n✏️  Testando PUT /api/patients/${testPatientId}`);
  
  const updateData = {
    name: 'Paciente Teste CRUD - ATUALIZADO',
    phone: '(11) 77777-7777',
    notes: 'Paciente atualizado durante teste de CRUD'
  };
  
  const result = await makeRequest('PUT', `/api/patients/${testPatientId}`, updateData);
  
  if (result.success) {
    console.log('✅ Atualização de paciente funcionando!');
    console.log(`   Nome atualizado: ${result.data.patient.name}`);
    console.log(`   Telefone atualizado: ${result.data.patient.phone}`);
  } else {
    console.error('❌ Erro ao atualizar paciente:', result.error);
  }
  
  return result.success;
}

async function testTogglePatientStatus() {
  if (!testPatientId) {
    console.log('\n⚠️  Pulando teste TOGGLE STATUS - nenhum paciente criado');
    return false;
  }
  
  console.log(`\n🔄 Testando PATCH /api/patients/${testPatientId}/toggle-status`);
  
  const result = await makeRequest('PATCH', `/api/patients/${testPatientId}/toggle-status`);
  
  if (result.success) {
    console.log('✅ Toggle de status funcionando!');
    console.log(`   Status atual: ${result.data.patient.is_active ? 'Ativo' : 'Inativo'}`);
  } else {
    console.error('❌ Erro ao alterar status:', result.error);
  }
  
  return result.success;
}

async function testSearchPatients() {
  console.log('\n🔎 Testando GET /api/patients/search');
  
  const result = await makeRequest('GET', '/api/patients/search?q=teste');
  
  if (result.success) {
    console.log('✅ Busca/autocomplete funcionando!');
    console.log(`   Resultados: ${result.data.patients?.length || 0}`);
  } else {
    console.error('❌ Erro na busca:', result.error);
  }
  
  return result.success;
}

async function testGetPatientsStats() {
  console.log('\n📊 Testando GET /api/patients/stats');
  
  const result = await makeRequest('GET', '/api/patients/stats');
  
  if (result.success) {
    console.log('✅ Estatísticas funcionando!');
    console.log(`   Total: ${result.data.stats.total}`);
    console.log(`   Ativos: ${result.data.stats.active}`);
    console.log(`   Masculino: ${result.data.stats.male}`);
    console.log(`   Feminino: ${result.data.stats.female}`);
  } else {
    console.error('❌ Erro ao buscar estatísticas:', result.error);
  }
  
  return result.success;
}

async function runAllTests() {
  console.log('🧪 INICIANDO TESTES DE CRUD DE PACIENTES');
  console.log('=' .repeat(50));
  
  const results = [];
  
  // 1. Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Teste abortado - falha no login');
    return;
  }
  
  // 2. Testar todas as operações CRUD
  results.push({ test: 'GET Patients', success: await testGetPatients() });
  results.push({ test: 'CREATE Patient', success: await testCreatePatient() });
  results.push({ test: 'GET Patient by ID', success: await testGetPatientById() });
  results.push({ test: 'UPDATE Patient', success: await testUpdatePatient() });
  results.push({ test: 'TOGGLE Status', success: await testTogglePatientStatus() });
  results.push({ test: 'SEARCH Patients', success: await testSearchPatients() });
  results.push({ test: 'GET Stats', success: await testGetPatientsStats() });
  
  // Resumo
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RESUMO DOS TESTES:');
  console.log('=' .repeat(50));
  
  let successCount = 0;
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.test}`);
    if (result.success) successCount++;
  });
  
  console.log('\n' + '=' .repeat(50));
  console.log(`🎯 RESULTADO FINAL: ${successCount}/${results.length} testes passaram`);
  
  if (successCount === results.length) {
    console.log('🎉 TODOS OS TESTES DE CRUD PASSARAM!');
  } else {
    console.log('⚠️  Alguns testes falharam - verificar logs acima');
  }
}

// Executar testes
runAllTests().catch(console.error);



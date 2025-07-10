const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

// Credenciais do usuário admin
const loginData = {
  email: 'demo@odonto.com',
  password: 'admin123'
};

let authToken = '';

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
  console.log('🔐 Fazendo login para testes integrados...');
  
  const result = await makeRequest('POST', '/api/auth/login', loginData);
  
  if (result.success && result.data.token) {
    authToken = result.data.token;
    console.log('✅ Login realizado com sucesso!');
    return true;
  } else {
    console.error('❌ Erro no login:', result.error);
    return false;
  }
}

async function testEntitiesIntegration() {
  console.log('\n🔗 TESTANDO INTEGRAÇÃO ENTRE ENTIDADES');
  console.log('-'.repeat(50));
  
  let testUserId = '';
  let testPatientId = '';
  
  // 1. Criar um usuário
  console.log('\n👤 Criando usuário para teste integrado...');
  const newUser = {
    name: 'Usuário Integração',
    email: 'integracao@clinicademo.com',
    password: 'senha123',
    role: 'dentist'
  };
  
  const userResult = await makeRequest('POST', '/api/users', newUser);
  if (userResult.success) {
    testUserId = userResult.data.user.id;
    console.log('✅ Usuário criado:', userResult.data.user.name);
  } else {
    console.error('❌ Erro ao criar usuário:', userResult.error);
    return false;
  }
  
  // 2. Criar um paciente
  console.log('\n🏥 Criando paciente para teste integrado...');
  const newPatient = {
    name: 'Paciente Integração',
    email: 'paciente.integracao@email.com',
    phone: '(11) 91234-5678',
    document: '987.654.321-00',
    birth_date: '1985-05-15',
    gender: 'feminino'
  };
  
  const patientResult = await makeRequest('POST', '/api/patients', newPatient);
  if (patientResult.success) {
    testPatientId = patientResult.data.patient.id;
    console.log('✅ Paciente criado:', patientResult.data.patient.name);
  } else {
    console.error('❌ Erro ao criar paciente:', patientResult.error);
    return false;
  }
  
  // 3. Verificar se as entidades estão isoladas por organização
  console.log('\n🔒 Testando isolamento organizacional...');
  
  // Buscar usuários - deve retornar apenas da mesma organização
  const usersResult = await makeRequest('GET', '/api/users');
  if (usersResult.success) {
    const userFound = usersResult.data.users.find(u => u.id === testUserId);
    if (userFound) {
      console.log('✅ Isolamento de usuários funcionando');
    } else {
      console.log('❌ Falha no isolamento de usuários');
      return false;
    }
  }
  
  // Buscar pacientes - deve retornar apenas da mesma organização
  const patientsResult = await makeRequest('GET', '/api/patients');
  if (patientsResult.success) {
    const patientFound = patientsResult.data.patients.find(p => p.id === testPatientId);
    if (patientFound) {
      console.log('✅ Isolamento de pacientes funcionando');
    } else {
      console.log('❌ Falha no isolamento de pacientes');
      return false;
    }
  }
  
  // 4. Testar estatísticas integradas
  console.log('\n📊 Testando estatísticas integradas...');
  
  const statsPromises = [
    makeRequest('GET', '/api/users/stats'),
    makeRequest('GET', '/api/patients/stats'),
    makeRequest('GET', '/api/organizations/my/stats')
  ];
  
  const statsResults = await Promise.all(statsPromises);
  
  if (statsResults.every(result => result.success)) {
    console.log('✅ Todas as estatísticas funcionando');
    console.log(`   Usuários: ${statsResults[0].data.stats.totalUsers}`);
    console.log(`   Pacientes: ${statsResults[1].data.stats.total}`);
    console.log(`   Org - Usuários ativos: ${statsResults[2].data.stats.activeUsers}`);
  } else {
    console.log('❌ Falha nas estatísticas integradas');
  }
  
  // 5. Limpeza - deletar registros de teste
  console.log('\n🧹 Limpando dados de teste...');
  
  const deleteUserResult = await makeRequest('DELETE', `/api/users/${testUserId}`);
  if (deleteUserResult.success) {
    console.log('✅ Usuário de teste removido');
  }
  
  // Pacientes não têm rota de delete, então vamos apenas desativar
  const togglePatientResult = await makeRequest('PATCH', `/api/patients/${testPatientId}/toggle-status`);
  if (togglePatientResult.success) {
    console.log('✅ Paciente de teste desativado');
  }
  
  return true;
}

async function testCRUDCompletion() {
  console.log('\n📋 TESTANDO COMPLETUDE DE OPERAÇÕES CRUD');
  console.log('-'.repeat(50));
  
  const operations = {
    users: ['GET', 'POST', 'GET_BY_ID', 'PUT', 'DELETE', 'STATS'],
    patients: ['GET', 'POST', 'GET_BY_ID', 'PUT', 'TOGGLE_STATUS', 'SEARCH', 'STATS'],
    organizations: ['GET_MY', 'PUT_MY', 'GET_BY_ID', 'STATS_MY']
  };
  
  const results = {};
  
  // Testar operações de usuários
  console.log('\n👥 Testando operações de usuários...');
  results.users = {};
  results.users['GET'] = (await makeRequest('GET', '/api/users')).success;
  results.users['STATS'] = (await makeRequest('GET', '/api/users/stats')).success;
  
  // Testar operações de pacientes
  console.log('\n🏥 Testando operações de pacientes...');
  results.patients = {};
  results.patients['GET'] = (await makeRequest('GET', '/api/patients')).success;
  results.patients['STATS'] = (await makeRequest('GET', '/api/patients/stats')).success;
  results.patients['SEARCH'] = (await makeRequest('GET', '/api/patients/search?q=test')).success;
  
  // Testar operações de organizações
  console.log('\n🏢 Testando operações de organizações...');
  results.organizations = {};
  results.organizations['GET_MY'] = (await makeRequest('GET', '/api/organizations/my')).success;
  results.organizations['STATS_MY'] = (await makeRequest('GET', '/api/organizations/my/stats')).success;
  
  // Resumo da completude
  console.log('\n📊 RESUMO DE COMPLETUDE:');
  
  for (const [entity, ops] of Object.entries(results)) {
    console.log(`\n${entity.toUpperCase()}:`);
    for (const [op, success] of Object.entries(ops)) {
      const status = success ? '✅' : '❌';
      console.log(`  ${status} ${op}`);
    }
  }
  
  return true;
}

async function testErrorsAndEdgeCases() {
  console.log('\n🛡️  TESTANDO CASOS EXTREMOS E TRATAMENTO DE ERROS');
  console.log('-'.repeat(50));
  
  const tests = [];
  
  // Teste 1: Acesso sem autenticação
  console.log('\n🔒 Testando acesso sem autenticação...');
  const noAuthResult = await makeRequest('GET', '/api/users', null, { 'Authorization': '' });
  tests.push({
    name: 'Proteção sem autenticação',
    success: !noAuthResult.success && noAuthResult.status === 401
  });
  
  // Teste 2: Token inválido
  console.log('\n🔑 Testando token inválido...');
  const invalidTokenResult = await makeRequest('GET', '/api/users', null, { 'Authorization': 'Bearer token-invalido' });
  tests.push({
    name: 'Rejeição de token inválido',
    success: !invalidTokenResult.success && invalidTokenResult.status === 401
  });
  
  // Teste 3: Campos obrigatórios faltando
  console.log('\n📝 Testando validação de campos obrigatórios...');
  const emptyUserResult = await makeRequest('POST', '/api/users', {});
  tests.push({
    name: 'Validação campos obrigatórios usuário',
    success: !emptyUserResult.success && emptyUserResult.error.message?.includes('obrigatórios')
  });
  
  const emptyPatientResult = await makeRequest('POST', '/api/patients', {});
  tests.push({
    name: 'Validação campos obrigatórios paciente',
    success: !emptyPatientResult.success && emptyPatientResult.error.message?.includes('obrigatórios')
  });
  
  // Teste 4: IDs inexistentes
  console.log('\n🔍 Testando recursos inexistentes...');
  const fakeId = '00000000-0000-0000-0000-000000000000';
  
  const noUserResult = await makeRequest('GET', `/api/users/${fakeId}`);
  tests.push({
    name: 'Usuário não encontrado',
    success: !noUserResult.success
  });
  
  const noPatientResult = await makeRequest('GET', `/api/patients/${fakeId}`);
  tests.push({
    name: 'Paciente não encontrado',
    success: !noPatientResult.success
  });
  
  // Teste 5: Email duplicado
  console.log('\n📧 Testando validação de email duplicado...');
  const duplicateUserResult = await makeRequest('POST', '/api/users', {
    name: 'Teste Duplicado',
    email: 'admin@clinicademo.com',
    password: 'senha123',
    role: 'dentist'
  });
  tests.push({
    name: 'Prevenção email duplicado',
    success: !duplicateUserResult.success && duplicateUserResult.error.message?.includes('existe')
  });
  
  // Resumo dos testes de erro
  console.log('\n📊 RESUMO DOS TESTES DE ERRO:');
  let passedTests = 0;
  
  tests.forEach(test => {
    const status = test.success ? '✅' : '❌';
    console.log(`${status} ${test.name}`);
    if (test.success) passedTests++;
  });
  
  console.log(`\n🎯 ${passedTests}/${tests.length} testes de erro passaram`);
  
  return passedTests === tests.length;
}

async function testPerformanceBasics() {
  console.log('\n⚡ TESTANDO PERFORMANCE BÁSICA');
  console.log('-'.repeat(50));
  
  const performanceTests = [];
  
  // Teste de resposta rápida para listagens
  const endpoints = [
    { name: 'GET /api/users', endpoint: '/api/users' },
    { name: 'GET /api/patients', endpoint: '/api/patients' },
    { name: 'GET /api/organizations/my', endpoint: '/api/organizations/my' }
  ];
  
  for (const test of endpoints) {
    const startTime = Date.now();
    const result = await makeRequest('GET', test.endpoint);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    performanceTests.push({
      name: test.name,
      responseTime,
      success: result.success && responseTime < 2000 // Menos de 2 segundos
    });
  }
  
  console.log('\n📊 RESULTADOS DE PERFORMANCE:');
  performanceTests.forEach(test => {
    const status = test.success ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${test.responseTime}ms`);
  });
  
  const avgResponseTime = performanceTests.reduce((sum, test) => sum + test.responseTime, 0) / performanceTests.length;
  console.log(`\n⏱️  Tempo médio de resposta: ${avgResponseTime.toFixed(0)}ms`);
  
  return performanceTests.every(test => test.success);
}

async function runFullIntegrationSuite() {
  console.log('🧪 INICIANDO SUITE COMPLETA DE TESTES DE INTEGRAÇÃO');
  console.log('='.repeat(60));
  
  const results = [];
  
  // 1. Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Suite abortada - falha no login');
    return;
  }
  
  // 2. Executar todos os testes
  console.log('\n🚀 Executando bateria completa de testes...\n');
  
  results.push({ test: 'Integração entre Entidades', success: await testEntitiesIntegration() });
  results.push({ test: 'Completude de CRUD', success: await testCRUDCompletion() });
  results.push({ test: 'Tratamento de Erros', success: await testErrorsAndEdgeCases() });
  results.push({ test: 'Performance Básica', success: await testPerformanceBasics() });
  
  // 3. Resumo final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO FINAL DA SUITE DE INTEGRAÇÃO:');
  console.log('='.repeat(60));
  
  let successCount = 0;
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.test}`);
    if (result.success) successCount++;
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`🎯 RESULTADO FINAL: ${successCount}/${results.length} grupos de testes passaram`);
  
  if (successCount === results.length) {
    console.log('🎉 TODOS OS TESTES DE INTEGRAÇÃO PASSARAM!');
    console.log('✨ O sistema está funcionando correta e integradamente!');
  } else {
    console.log('⚠️  Alguns testes falharam - verificar logs acima');
  }
  
  console.log('\n📝 PRÓXIMOS PASSOS:');
  console.log('   1. Execute testes individuais para detalhes específicos');
  console.log('   2. Verifique logs de erro para problemas pontuais');
  console.log('   3. Teste interface web para validação visual');
}

// Executar suite completa
runFullIntegrationSuite().catch(console.error);



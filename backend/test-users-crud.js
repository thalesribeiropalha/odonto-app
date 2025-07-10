const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

// Credenciais do usuário admin
const loginData = {
  email: 'admin@clinicademo.com',
  password: 'admin123'
};

let authToken = '';
let testUserId = '';

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

async function testGetUsers() {
  console.log('\n👥 Testando GET /api/users');
  
  const result = await makeRequest('GET', '/api/users');
  
  if (result.success) {
    console.log('✅ Busca de usuários funcionando!');
    console.log(`   Usuários encontrados: ${result.data.users?.length || 0}`);
    if (result.data.users && result.data.users.length > 0) {
      console.log(`   Primeiro usuário: ${result.data.users[0].name} (${result.data.users[0].role})`);
    }
  } else {
    console.error('❌ Erro ao buscar usuários:', result.error);
  }
  
  return result.success;
}

async function testCreateUser() {
  console.log('\n➕ Testando POST /api/users');
  
  const newUser = {
    name: 'Usuário Teste CRUD',
    email: 'usuario.teste@clinicademo.com',
    password: 'senha123',
    role: 'dentist',
    profile: {
      cro: '12345-SP',
      specialty: 'Ortodontia',
      phone: '(11) 99999-9999'
    }
  };
  
  const result = await makeRequest('POST', '/api/users', newUser);
  
  if (result.success) {
    testUserId = result.data.user.id;
    console.log('✅ Criação de usuário funcionando!');
    console.log(`   ID do usuário criado: ${testUserId}`);
    console.log(`   Nome: ${result.data.user.name}`);
    console.log(`   Role: ${result.data.user.role}`);
  } else {
    console.error('❌ Erro ao criar usuário:', result.error);
  }
  
  return result.success;
}

async function testGetUserById() {
  if (!testUserId) {
    console.log('\n⚠️  Pulando teste GET by ID - nenhum usuário criado');
    return false;
  }
  
  console.log(`\n🔍 Testando GET /api/users/${testUserId}`);
  
  const result = await makeRequest('GET', `/api/users/${testUserId}`);
  
  if (result.success) {
    console.log('✅ Busca de usuário por ID funcionando!');
    console.log(`   Nome: ${result.data.user.name}`);
    console.log(`   Email: ${result.data.user.email}`);
    console.log(`   Role: ${result.data.user.role}`);
  } else {
    console.error('❌ Erro ao buscar usuário por ID:', result.error);
  }
  
  return result.success;
}

async function testUpdateUser() {
  if (!testUserId) {
    console.log('\n⚠️  Pulando teste UPDATE - nenhum usuário criado');
    return false;
  }
  
  console.log(`\n✏️  Testando PUT /api/users/${testUserId}`);
  
  const updateData = {
    name: 'Usuário Teste CRUD - ATUALIZADO',
    email: 'usuario.teste.atualizado@clinicademo.com',
    role: 'secretary',
    profile: {
      cro: '54321-SP',
      specialty: 'Atendimento',
      phone: '(11) 88888-8888'
    }
  };
  
  const result = await makeRequest('PUT', `/api/users/${testUserId}`, updateData);
  
  if (result.success) {
    console.log('✅ Atualização de usuário funcionando!');
    console.log(`   Nome atualizado: ${result.data.user.name}`);
    console.log(`   Role atualizado: ${result.data.user.role}`);
  } else {
    console.error('❌ Erro ao atualizar usuário:', result.error);
  }
  
  return result.success;
}

async function testGetUsersWithFilters() {
  console.log('\n🔍 Testando GET /api/users com filtros');
  
  // Teste busca por role
  const result1 = await makeRequest('GET', '/api/users?role=secretary');
  
  if (result1.success) {
    console.log('✅ Filtro por role funcionando!');
    console.log(`   Usuários secretary: ${result1.data.users?.length || 0}`);
  } else {
    console.error('❌ Erro no filtro por role:', result1.error);
  }
  
  // Teste busca por texto
  const result2 = await makeRequest('GET', '/api/users?search=teste');
  
  if (result2.success) {
    console.log('✅ Busca por texto funcionando!');
    console.log(`   Usuários encontrados: ${result2.data.users?.length || 0}`);
  } else {
    console.error('❌ Erro na busca por texto:', result2.error);
  }
  
  return result1.success && result2.success;
}

async function testGetUsersStats() {
  console.log('\n📊 Testando GET /api/users/stats');
  
  const result = await makeRequest('GET', '/api/users/stats');
  
  if (result.success) {
    console.log('✅ Estatísticas de usuários funcionando!');
    console.log(`   Total: ${result.data.stats.totalUsers}`);
    console.log(`   Ativos: ${result.data.stats.activeUsers}`);
    console.log(`   Admin: ${result.data.stats.byRole.admin}`);
    console.log(`   Dentist: ${result.data.stats.byRole.dentist}`);
    console.log(`   Secretary: ${result.data.stats.byRole.secretary}`);
  } else {
    console.error('❌ Erro ao buscar estatísticas:', result.error);
  }
  
  return result.success;
}

async function testDeleteUser() {
  if (!testUserId) {
    console.log('\n⚠️  Pulando teste DELETE - nenhum usuário criado');
    return false;
  }
  
  console.log(`\n🗑️  Testando DELETE /api/users/${testUserId}`);
  
  const result = await makeRequest('DELETE', `/api/users/${testUserId}`);
  
  if (result.success) {
    console.log('✅ Exclusão de usuário funcionando!');
    console.log('   Usuário deletado com sucesso');
  } else {
    console.error('❌ Erro ao deletar usuário:', result.error);
  }
  
  return result.success;
}

async function testErrorHandling() {
  console.log('\n🛡️  Testando tratamento de erros');
  
  // Teste 1: Criar usuário sem dados obrigatórios
  const result1 = await makeRequest('POST', '/api/users', {});
  if (!result1.success && result1.error.message?.includes('obrigatórios')) {
    console.log('✅ Validação de campos obrigatórios funcionando!');
  } else {
    console.log('❌ Falha na validação de campos obrigatórios');
  }
  
  // Teste 2: Email duplicado
  const duplicateUser = {
    name: 'Teste Duplicado',
    email: 'admin@clinicademo.com', 
    password: 'senha123',
    role: 'dentist'
  };
  
  const result2 = await makeRequest('POST', '/api/users', duplicateUser);
  if (!result2.success && result2.error.message?.includes('existe')) {
    console.log('✅ Validação de email duplicado funcionando!');
  } else {
    console.log('❌ Falha na validação de email duplicado');
  }
  
  // Teste 3: Buscar usuário inexistente
  const result3 = await makeRequest('GET', '/api/users/00000000-0000-0000-0000-000000000000');
  if (!result3.success) {
    console.log('✅ Tratamento de usuário não encontrado funcionando!');
  } else {
    console.log('❌ Falha no tratamento de usuário não encontrado');
  }
  
  return true;
}

async function runAllTests() {
  console.log('🧪 INICIANDO TESTES DE CRUD DE USUÁRIOS');
  console.log('=' .repeat(50));
  
  const results = [];
  
  // 1. Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Teste abortado - falha no login');
    return;
  }
  
  // 2. Testar todas as operações CRUD
  results.push({ test: 'GET Users', success: await testGetUsers() });
  results.push({ test: 'CREATE User', success: await testCreateUser() });
  results.push({ test: 'GET User by ID', success: await testGetUserById() });
  results.push({ test: 'UPDATE User', success: await testUpdateUser() });
  results.push({ test: 'GET Users with Filters', success: await testGetUsersWithFilters() });
  results.push({ test: 'GET Users Stats', success: await testGetUsersStats() });
  results.push({ test: 'DELETE User', success: await testDeleteUser() });
  results.push({ test: 'Error Handling', success: await testErrorHandling() });
  
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
    console.log('🎉 TODOS OS TESTES DE USUÁRIOS PASSARAM!');
  } else {
    console.log('⚠️  Alguns testes falharam - verificar logs acima');
  }
}

// Executar testes
runAllTests().catch(console.error);




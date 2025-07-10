const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:3002/api';

// Simular login para obter token
async function getAuthToken() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@clinicademo.com',
      password: 'admin123'
    });
    
    if (response.data.success) {
      console.log('✅ Login realizado com sucesso');
      return response.data.token;
    } else {
      throw new Error('Falha no login');
    }
  } catch (error) {
    console.error('❌ Erro no login:', error.response?.data?.message || error.message);
    return null;
  }
}

// Testar API de pacientes
async function testPatientsAPI() {
  console.log('🔄 Iniciando testes da API de pacientes...\n');

  // 1. Obter token de autenticação
  const token = await getAuthToken();
  if (!token) {
    console.log('❌ Não foi possível obter token. Abortando testes.');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    // 2. Testar listagem de pacientes
    console.log('📋 Testando GET /api/patients...');
    const listResponse = await axios.get(`${BASE_URL}/patients`, { headers });
    
    if (listResponse.data.success) {
      console.log(`✅ Listagem: ${listResponse.data.patients.length} pacientes encontrados`);
      listResponse.data.patients.forEach((patient, index) => {
        console.log(`   ${index + 1}. ${patient.name} - CPF: ${patient.document}`);
      });
    }

    // 3. Testar estatísticas
    console.log('\n📊 Testando GET /api/patients/stats...');
    const statsResponse = await axios.get(`${BASE_URL}/patients/stats`, { headers });
    
    if (statsResponse.data.success) {
      const stats = statsResponse.data.stats;
      console.log('✅ Estatísticas:');
      console.log(`   Total: ${stats.total}`);
      console.log(`   Ativos: ${stats.active}`);
      console.log(`   Inativos: ${stats.inactive}`);
      console.log(`   Masculino: ${stats.male}`);
      console.log(`   Feminino: ${stats.female}`);
    }

    // 4. Testar busca
    console.log('\n🔍 Testando GET /api/patients/search...');
    const searchResponse = await axios.get(`${BASE_URL}/patients/search?q=joão`, { headers });
    
    if (searchResponse.data.success) {
      console.log(`✅ Busca por "joão": ${searchResponse.data.patients.length} resultados`);
      searchResponse.data.patients.forEach(patient => {
        console.log(`   - ${patient.name}`);
      });
    }

    // 5. Testar criação de paciente
    console.log('\n➕ Testando POST /api/patients...');
    const newPatient = {
      name: 'Maria Teste',
      email: 'maria.teste@email.com',
      phone: '11999887766',
      document: '55544433322',
      birth_date: '1995-05-20',
      gender: 'feminino',
      address: {
        cep: '01234-567',
        street: 'Rua Teste',
        number: '123',
        city: 'São Paulo',
        state: 'SP'
      }
    };

    const createResponse = await axios.post(`${BASE_URL}/patients`, newPatient, { headers });
    
    if (createResponse.data.success) {
      console.log('✅ Paciente criado com sucesso:', createResponse.data.patient.name);
      const createdPatientId = createResponse.data.patient.id;

      // 6. Testar busca por ID
      console.log('\n🔍 Testando GET /api/patients/:id...');
      const getByIdResponse = await axios.get(`${BASE_URL}/patients/${createdPatientId}`, { headers });
      
      if (getByIdResponse.data.success) {
        console.log('✅ Paciente encontrado:', getByIdResponse.data.patient.name);
      }

      // 7. Testar atualização
      console.log('\n✏️ Testando PUT /api/patients/:id...');
      const updateData = {
        name: 'Maria Teste Atualizada',
        notes: 'Paciente de teste - dados atualizados'
      };

      const updateResponse = await axios.put(`${BASE_URL}/patients/${createdPatientId}`, updateData, { headers });
      
      if (updateResponse.data.success) {
        console.log('✅ Paciente atualizado:', updateResponse.data.patient.name);
      }

      // 8. Testar toggle de status
      console.log('\n🔄 Testando PATCH /api/patients/:id/toggle-status...');
      const toggleResponse = await axios.patch(`${BASE_URL}/patients/${createdPatientId}/toggle-status`, {}, { headers });
      
      if (toggleResponse.data.success) {
        console.log('✅ Status alterado:', toggleResponse.data.message);
      }

    } else {
      console.log('❌ Erro ao criar paciente:', createResponse.data.message);
    }

    console.log('\n🎉 Todos os testes concluídos!');

  } catch (error) {
    console.error('\n❌ Erro durante os testes:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Detalhes:', error.response.data);
    }
  }
}

// Executar testes
testPatientsAPI()
  .then(() => {
    console.log('\n✅ Testes da API de pacientes finalizados');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Falha nos testes:', error);
    process.exit(1);
  });


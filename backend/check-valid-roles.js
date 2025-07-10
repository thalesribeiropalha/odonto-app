const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 Verificando roles válidos na tabela users...');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkValidRoles() {
  try {
    // Tentar consultar a constraint da tabela
    console.log('📋 Consultando estrutura da tabela users...');
    
    // Buscar todos os usuários existentes para ver os roles em uso
    const { data: users, error } = await supabase
      .from('users')
      .select('role')
      .limit(10);
    
    if (error) {
      console.error('❌ Erro ao consultar usuários:', error);
    } else {
      console.log('\n👥 Roles encontrados nos usuários existentes:');
      const uniqueRoles = [...new Set(users.map(user => user.role))];
      uniqueRoles.forEach(role => {
        console.log(`   - ${role}`);
      });
    }
    
    // Tentar criar um usuário com role válido (admin) para testar
    console.log('\n🧪 Testando criação com role "admin"...');
    
    const testUser = {
      name: 'Admin Teste',
      email: `admin.teste.${Date.now()}@temp.com`,
      password: '$2a$12$test',
      role: 'admin',
      organization_id: 'fc380e62-de4e-495d-9914-d5fbb5447058',
      permissions: ['users.read'],
      is_active: true
    };
    
    const { data: adminTest, error: adminError } = await supabase
      .from('users')
      .insert([testUser])
      .select('id, role')
      .single();
    
    if (adminError) {
      console.error('❌ Erro ao testar admin:', adminError);
    } else {
      console.log(`✅ Admin criado com sucesso: ID ${adminTest.id}`);
      
      // Remover usuário de teste
      await supabase.from('users').delete().eq('id', adminTest.id);
      console.log('🗑️  Usuário de teste removido');
    }
    
    // Testar roles que podem não estar válidos
    const rolesToTest = ['proprietario', 'dentista', 'secretaria'];
    
    console.log('\n🧪 Testando roles customizados...');
    
    for (const role of rolesToTest) {
      const testUserCustom = {
        name: `Teste ${role}`,
        email: `${role}.teste.${Date.now()}@temp.com`,
        password: '$2a$12$test',
        role: role,
        organization_id: 'fc380e62-de4e-495d-9914-d5fbb5447058',
        permissions: ['patients.read'],
        is_active: true
      };
      
      const { data, error } = await supabase
        .from('users')
        .insert([testUserCustom])
        .select('id, role')
        .single();
      
      if (error) {
        console.log(`❌ Role "${role}" NÃO é válido:`, error.message);
      } else {
        console.log(`✅ Role "${role}" é válido: ID ${data.id}`);
        // Remover usuário de teste
        await supabase.from('users').delete().eq('id', data.id);
        console.log(`🗑️  Usuário de teste "${role}" removido`);
      }
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  }
}

checkValidRoles();


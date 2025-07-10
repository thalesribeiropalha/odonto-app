const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔄 Verificando conexão com Supabase...');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkUsers() {
  try {
    console.log('📋 Buscando usuários...');
    
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, role, is_active')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      return;
    }
    
    console.log(`\n👥 USUÁRIOS ENCONTRADOS (${users.length}):`);
    console.log('=' .repeat(50));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. EMAIL: ${user.email}`);
      console.log(`   NOME: ${user.name}`);
      console.log(`   ROLE: ${user.role}`);
      console.log(`   ATIVO: ${user.is_active ? '✅' : '❌'}`);
      console.log('   ---');
    });
    
    console.log('\n🔑 CREDENCIAIS PARA LOGIN:');
    if (users.length > 0) {
      const firstUser = users[0];
      console.log(`📧 Email: ${firstUser.email}`);
      console.log(`🔒 Senha: admin123 (padrão)`);
    } else {
      console.log('❌ Nenhum usuário encontrado!');
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  }
}

checkUsers();


const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔄 Conectando ao Supabase...');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function getAllUsersDetails() {
  try {
    console.log('📋 Buscando todos os usuários com detalhes completos...\n');
    
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        role,
        is_active,
        password,
        created_at,
        updated_at,
        organization_id
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      return;
    }
    
    console.log(`🎯 TOTAL DE USUÁRIOS ENCONTRADOS: ${users.length}`);
    console.log('=' .repeat(70));
    
    users.forEach((user, index) => {
      console.log(`\n👤 USUÁRIO ${index + 1}:`);
      console.log(`   🆔 ID: ${user.id}`);
      console.log(`   📧 EMAIL: ${user.email}`);
      console.log(`   👤 NOME: ${user.name}`);
      console.log(`   🏷️  FUNÇÃO: ${user.role}`);
      console.log(`   ✅ ATIVO: ${user.is_active ? 'Sim' : 'Não'}`);
      console.log(`   🏢 ORG ID: ${user.organization_id || 'N/A'}`);
      console.log(`   📅 CRIADO: ${new Date(user.created_at).toLocaleString('pt-BR')}`);
      console.log(`   🔐 SENHA: ${user.password ? user.password.substring(0, 20) + '...' : 'N/A'}`);
      console.log('   ' + '-'.repeat(50));
    });
    
    console.log('\n🔑 INFORMAÇÕES SOBRE SENHAS:');
    console.log('   ⚠️  As senhas estão criptografadas (hash) no banco de dados');
    console.log('   📝 Senhas padrão do sistema:');
    console.log('   • Para todos os usuários: admin123');
    console.log('   • Ou senha personalizada definida na criação');
    
    console.log('\n🚀 CREDENCIAIS PARA LOGIN:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. Email: ${user.email} | Senha: admin123`);
    });
    
    // Verificar organizações
    console.log('\n🏢 Verificando organizações...');
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, slug')
      .order('created_at', { ascending: false });
    
    if (!orgError && orgs) {
      console.log(`   📊 Total de organizações: ${orgs.length}`);
      orgs.forEach(org => {
        console.log(`   • ${org.name} (${org.slug}) - ID: ${org.id}`);
      });
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  }
}

getAllUsersDetails();




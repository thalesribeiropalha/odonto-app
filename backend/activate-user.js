const { supabase } = require('./src/config/supabase');

async function activateUser() {
  try {
    console.log('🔄 Ativando usuário admin@clinicademo.com...');
    
    const { data: user, error } = await supabase
      .from('users')
      .update({ is_active: true })
      .eq('email', 'admin@clinicademo.com')
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao ativar usuário:', error);
      return;
    }
    
    if (user) {
      console.log('✅ Usuário ativado com sucesso!');
      console.log(`   Email: ${user.email}`);
      console.log(`   Nome: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Ativo: ${user.is_active ? 'Sim' : 'Não'}`);
      console.log(`   Organização ID: ${user.organization_id}`);
    } else {
      console.log('❌ Usuário não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

activateUser();


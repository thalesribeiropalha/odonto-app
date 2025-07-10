const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

console.log('🔄 Resetando senha do usuário...');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function resetUserPassword() {
  try {
    const email = 'dralarissarufino@gmail.com';
    const newPassword = 'demo123';
    
    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    console.log(`\n🔍 Procurando usuário: ${email}`);
    
    // Verificar se usuário existe
    const { data: existingUser, error: searchError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('email', email)
      .single();
    
    if (searchError || !existingUser) {
      console.error(`❌ Usuário ${email} não encontrado no banco:`, searchError);
      return;
    }
    
    console.log(`✅ Usuário encontrado:`);
    console.log(`   📧 Email: ${existingUser.email}`);
    console.log(`   👤 Nome: ${existingUser.name}`);
    console.log(`   🎭 Role: ${existingUser.role}`);
    
    // Atualizar senha
    const { data, error } = await supabase
      .from('users')
      .update({ 
        password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select('id, name, email, role')
      .single();
    
    if (error) {
      console.error('❌ Erro ao atualizar senha:', error);
      return;
    }
    
    console.log('\n🎉 Senha atualizada com sucesso!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Nova senha: ${newPassword}`);
    console.log(`👤 Nome: ${data.name}`);
    console.log(`🎭 Role: ${data.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  }
}

resetUserPassword();


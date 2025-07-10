const { supabase } = require('./src/config/supabase');

async function main() {
  try {
    console.log('🧹 Limpando dados demo...');
    
    // Deletar usuários demo
    await supabase
      .from('users')
      .delete()
      .eq('email', 'demo@odonto.com');
    
    await supabase
      .from('users')
      .delete()
      .like('email', '%@odonto.com');
    
    // Deletar organizações demo
    await supabase
      .from('organizations')
      .delete()
      .in('slug', ['odonto-plus', 'dental-care']);
    
    console.log('✅ Dados demo limpos!');
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

main();

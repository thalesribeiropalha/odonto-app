const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase via variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Verificar se as variáveis estão definidas
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!');
  console.error('Verifique se o arquivo .env tem as seguintes variáveis:');
  console.error('- SUPABASE_URL');
  console.error('- SUPABASE_ANON_KEY');
  console.error('- SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Cliente para operações normais (com RLS)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente administrativo (bypass RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Função para testar conexão
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);
      
    if (error && error.code === 'PGRST116') {
      console.log('🔧 Tabelas ainda não criadas - execute o SQL no Supabase');
      return true;
    }
    
    if (error) {
      console.error('❌ Erro na conexão Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Supabase conectado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error.message);
    return false;
  }
};

module.exports = {
  supabase,
  supabaseAdmin,
  testConnection
};


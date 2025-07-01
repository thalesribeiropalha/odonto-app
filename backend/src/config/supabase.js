const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase via variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL || 'https://ahnygfwpzuierxsitore.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobnlnZndwenVpZXJ4c2l0b3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMzA1MzQsImV4cCI6MjA2NjkwNjUzNH0.X4nVjM2rz-DpXmZ8GK6yZKmj3JK-eMkThUt6onMcBmI';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobnlnZndwenVpZXJ4c2l0b3JlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzMDUzNCwiZXhwIjoyMDY2OTA2NTM0fQ.bL2PWsFomxBEGks0Skq6vMf2naTkocpOo5tdjKhPnUs';

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

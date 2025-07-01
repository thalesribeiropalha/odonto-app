const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase (você precisa preencher com suas credenciais)
const supabaseUrl = 'https://ahnygfwpzuierxsitore.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobnlnZndwenVpZXJ4c2l0b3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NjI5NjUsImV4cCI6MjA1MTIzODk2NX0.VaQJoOQRKlGKCbvQcGEECgNYZzBkqXKyqKPYGqxfMQ4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateUserPassword() {
  try {
    const newPasswordHash = '$2b$10$DT5MRoYLsy/.FbYlQvgXm.U3ojklkUfrqhCOvgUmgY42Ld25Xdq7i';
    
    const { data, error } = await supabase
      .from('users')
      .update({ password: newPasswordHash })
      .eq('email', 'admin@clinicademo.com')
      .select();

    if (error) {
      console.error('Erro ao atualizar senha:', error);
      return;
    }

    console.log('Senha atualizada com sucesso!');
    console.log('Usuário atualizado:', data);
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

updateUserPassword();

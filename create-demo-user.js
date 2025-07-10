const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://ahnygfwpzuierxsitore.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobnlnZndwenVpZXJ4c2l0b3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzM4ODEsImV4cCI6MjA1MTI0OTg4MX0.Kc6vGnwK7BHJWgz-Hs6f9XbhQxo4bZhz5QLj8Hs7kBs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log('🔍 Verificando usuário demo...');
    
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'demo@odonto.com')
      .single();

    if (existingUser) {
      console.log('✅ Usuário demo já existe');
      return;
    }

    console.log('👤 Criando usuário demo...');
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        name: 'Admin Demo',
        email: 'demo@odonto.com',
        password: hashedPassword,
        role: 'admin',
        permissions: ['*'],
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro:', error);
      return;
    }

    console.log('✅ Usuário criado:', user.id);

    // Criar 2 organizações
    console.log('🏢 Criando organizações...');
    
    await supabase.from('organizations').insert([
      {
        name: 'Clínica Odonto Plus',
        slug: 'odonto-plus',
        email: 'contato@odontoplus.com',
        created_by: user.id,
        subscription: { plan: 'professional' },
        is_active: true
      },
      {
        name: 'Dental Care',
        slug: 'dental-care', 
        email: 'contato@dentalcare.com',
        created_by: user.id,
        subscription: { plan: 'starter' },
        is_active: true
      }
    ]);

    console.log('✅ Organizações criadas!');
    console.log('📧 Login: demo@odonto.com');
    console.log('🔑 Senha: demo123');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

main();

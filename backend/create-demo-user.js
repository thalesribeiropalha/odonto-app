const { supabase } = require('./src/config/supabase');
const bcrypt = require('bcryptjs');

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

    // Criar usuários de exemplo
    console.log('👥 Criando usuários de exemplo...');
    
    const demoUsers = [
      {
        name: 'Dr. João Silva',
        email: 'joao.silva@odonto.com',
        password: await bcrypt.hash('demo123', 10),
        role: 'dentist',
        organization_id: user.id,
        permissions: ['users.read', 'patients.create', 'patients.read', 'patients.update'],
        is_active: true
      },
      {
        name: 'Maria Santos',
        email: 'maria.santos@odonto.com',
        password: await bcrypt.hash('demo123', 10),
        role: 'secretary',
        organization_id: user.id,
        permissions: ['users.read', 'patients.read', 'appointments.create'],
        is_active: true
      },
      {
        name: 'Dr. Ana Costa',
        email: 'ana.costa@odonto.com',
        password: await bcrypt.hash('demo123', 10),
        role: 'dentist',
        organization_id: user.id,
        permissions: ['users.read', 'patients.create', 'patients.read', 'patients.update'],
        is_active: false
      }
    ];

    await supabase.from('users').insert(demoUsers);

    console.log('✅ Usuários de exemplo criados!');
    console.log('📧 Login: demo@odonto.com');
    console.log('🔑 Senha: demo123');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

main();

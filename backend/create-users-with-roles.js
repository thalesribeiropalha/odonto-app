const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

console.log('🔄 Criando usuários com diferentes perfis...');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createUsersWithRoles() {
  try {
    const organizationId = 'fc380e62-de4e-495d-9914-d5fbb5447058';
    
    // Senha padrão para todos os usuários de teste
    const defaultPassword = 'teste123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    
    const testUsers = [
      {
        name: 'Dr. Proprietário Sistema',
        email: 'owner@teste.com',
        password: hashedPassword,
        role: 'owner',
        organization_id: null, // Owner não precisa de organização específica
        permissions: ['*'],
        is_active: true
      },
      {
        name: 'Admin Clínica',
        email: 'admin@teste.com',
        password: hashedPassword,
        role: 'admin',
        organization_id: organizationId,
        permissions: [
          'organization.manage',
          'users.create', 'users.read', 'users.update', 'users.delete',
          'patients.create', 'patients.read', 'patients.update', 'patients.delete',
          'appointments.create', 'appointments.read', 'appointments.update', 'appointments.delete',
          'financial.create', 'financial.read', 'financial.update', 'financial.delete',
          'reports.read'
        ],
        is_active: true
      },
      {
        name: 'Dr. João Dentista',
        email: 'dentist@teste.com',
        password: hashedPassword,
        role: 'dentist',
        organization_id: organizationId,
        permissions: [
          'patients.create', 'patients.read', 'patients.update', 'patients.delete',
          'appointments.create', 'appointments.read', 'appointments.update', 'appointments.delete',
          'financial.create', 'financial.read', 'financial.update', 'financial.delete'
        ],
        is_active: true
      },
      {
        name: 'Maria Secretária',
        email: 'secretary@teste.com',
        password: hashedPassword,
        role: 'secretary',
        organization_id: organizationId,
        permissions: [
          'patients.create', 'patients.read', 'patients.update', 'patients.delete',
          'appointments.create', 'appointments.read', 'appointments.update', 'appointments.delete',
          'financial.create', 'financial.read', 'financial.update', 'financial.delete'
        ],
        is_active: true
      }
    ];
    
    console.log(`\n🎯 Criando ${testUsers.length} usuários de teste...`);
    
    for (let i = 0; i < testUsers.length; i++) {
      const userData = testUsers[i];
      console.log(`\n📝 Criando usuário ${i + 1}: ${userData.name} (${userData.role})`);
      
      // Verificar se usuário já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();
      
      if (existingUser) {
        console.log(`⚠️  Usuário ${userData.email} já existe. Pulando...`);
        continue;
      }
      
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select('id, name, email, role')
        .single();
      
      if (error) {
        console.error(`❌ Erro ao criar ${userData.name}:`, error);
      } else {
        console.log(`✅ ${userData.name} criado com ID: ${data.id}`);
        console.log(`   📧 Email: ${data.email}`);
        console.log(`   👤 Role: ${data.role}`);
        console.log(`   🔑 Senha: ${defaultPassword}`);
      }
    }
    
    // Verificar usuários criados por role
    console.log(`\n📊 Verificando usuários por perfil...`);
    
    const roles = ['owner', 'admin', 'dentist', 'secretary'];
    
    for (const role of roles) {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', role)
        .eq('is_active', true);
      
      if (error) {
        console.error(`❌ Erro ao contar usuários ${role}:`, error);
      } else {
        console.log(`   ${role}: ${count || 0} usuário(s)`);
      }
    }
    
    console.log('\n🎉 Usuários de teste criados com sucesso!');
    console.log('\n🔐 Credenciais para teste:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 owner@teste.com     | 🔑 teste123 | 👑 Proprietário');
    console.log('📧 admin@teste.com     | 🔑 teste123 | 🛠️  Admin');
    console.log('📧 dentist@teste.com   | 🔑 teste123 | 🦷 Dentista');
    console.log('📧 secretary@teste.com | 🔑 teste123 | 📝 Secretária');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  }
}

createUsersWithRoles();




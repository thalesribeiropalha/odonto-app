const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const bcrypt = require('bcrypt');

// Função auxiliar para hash de senha
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Função auxiliar para comparar senhas
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Gerar JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret-key', {
    expiresIn: '14d',
  });
};

// Obter permissões padrão por role
const getDefaultPermissions = (role) => {
  const permissions = {
    owner: ['users.create', 'users.read', 'users.update', 'users.delete', 'organization.manage', 'reports.read', 'settings.update'],
    admin: ['users.create', 'users.read', 'users.update', 'users.delete', 'reports.read'],
    dentist: ['users.read', 'patients.create', 'patients.read', 'patients.update', 'appointments.create', 'appointments.read', 'appointments.update'],
    secretary: ['users.read', 'patients.read', 'appointments.create', 'appointments.read', 'appointments.update']
  };
  return permissions[role] || [];
};

// Registrar usuário simples
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    // Verificar se usuário já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(400).json({
        message: 'Usuário já existe com este email'
      });
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar usuário
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role || 'admin',
        permissions: getDefaultPermissions(role || 'admin'),
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({
        message: 'Erro ao criar usuário',
        error: error.message
      });
    }

    res.status(201).json({
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token: generateToken(newUser.id),
      message: 'Usuário criado com sucesso!'
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Login do usuário
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário pelo email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    // 1. Usuário não encontrado
    if (error || !user) {
      return res.status(404).json({
        message: 'Usuário não encontrado no sistema.'
      });
    }
    
    // 2. Usuário inativo
    if (!user.is_active) {
      return res.status(403).json({
        message: 'Este usuário foi desativado. Contate o administrador.'
      });
    }

    // 3. Senha incorreta
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Senha incorreta. Por favor, tente novamente.'
      });
    }

    // Atualizar último login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
      message: 'Login realizado com sucesso!'
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter perfil do usuário
const getUserProfile = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at, last_login, profile')
      .eq('id', req.user.id)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return res.status(404).json({
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      profile: user.profile || {}
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Registrar usuário com organização
const registerWithOrganization = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password,
      organizationName,
      organizationDocument,
      organizationEmail,
      organizationPhone,
      organizationAddress
    } = req.body;

    if (!name || !email || !password || !organizationName) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email, senha e nome da organização são obrigatórios'
      });
    }

    // Verificar se usuário já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe com este email'
      });
    }

    // Verificar se organização já existe
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('email', (organizationEmail || email).toLowerCase())
      .single();

    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma organização com este email'
      });
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar organização primeiro
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert([{
        name: organizationName.trim(),
        slug: organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
        document: organizationDocument?.trim(),
        email: (organizationEmail || email).toLowerCase().trim(),
        phone: organizationPhone?.trim(),
        address: organizationAddress || {},
        subscription: {
          plan: 'starter',
          maxUsers: 5,
          maxPatients: 100,
          features: ['basic'],
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true
        },
        is_active: true
      }])
      .select()
      .single();

    if (orgError) {
      console.error('Erro ao criar organização:', orgError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar organização',
        error: orgError.message
      });
    }

    // Criar usuário como owner da organização
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([{
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        organization_id: organization.id,
        role: 'owner',
        permissions: getDefaultPermissions('owner'),
        is_active: true
      }])
      .select()
      .single();

    if (userError) {
      console.error('Erro ao criar usuário:', userError);
      // Limpar organização criada em caso de erro
      await supabase.from('organizations').delete().eq('id', organization.id);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar usuário',
        error: userError.message
      });
    }

    // Atualizar organização com created_by
    await supabase
      .from('organizations')
      .update({ created_by: newUser.id })
      .eq('id', organization.id);

    res.status(201).json({
      success: true,
      message: 'Usuário e organização criados com sucesso!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token: generateToken(newUser.id)
      },
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug
      }
    });
  } catch (error) {
    console.error('Erro ao registrar com organização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  registerWithOrganization
};


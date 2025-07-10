const { supabase, supabaseAdmin } = require('../config/supabase');
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

// Listar usuários da organização
const getUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const organizationId = req.organization?.id;
    
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organização não identificada'
      });
    }

    let query = supabase
      .from('users')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    if (role && role !== 'all') {
      query = query.eq('role', role);
    }
    
    if (status && status !== 'all') {
      const isActive = status === 'active';
      query = query.eq('is_active', isActive);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar usuários',
        error: error.message
      });
    }

    res.json({
      success: true,
      total: users.length,
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        lastLogin: user.last_login,
        profile: user.profile || {}
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Criar usuário na organização
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, profile } = req.body;
    const organizationId = req.organization?.id;
    const createdBy = req.user?.id;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email, senha e role são obrigatórios'
      });
    }
    
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organização não identificada'
      });
    }
    
    // Verificar se já existe usuário com este email na organização
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('organization_id', organizationId)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um usuário com este email na organização'
      });
    }
    
    // Hash da senha
    const hashedPassword = await hashPassword(password);
    
    // Criar usuário
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role,
        organization_id: organizationId,
        permissions: getDefaultPermissions(role),
        profile: profile || {},
        created_by: createdBy,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar usuário',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        profile: user.profile || {}
      }
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter usuário específico
const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.organization?.id;
    
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organização não identificada'
      });
    }
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar usuário',
        error: error.message
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        lastLogin: user.last_login,
        profile: user.profile || {},
        permissions: user.permissions || []
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Atualizar usuário
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, profile, isActive } = req.body;
    const organizationId = req.organization?.id;
    
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organização não identificada'
      });
    }
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nome e email são obrigatórios'
      });
    }
    
    // Verificar se já existe outro usuário com este email na organização
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('organization_id', organizationId)
      .neq('id', id)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Já existe outro usuário com este email na organização'
      });
    }
    
    const updateData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      profile: profile || {}
    };
    
    // Só atualizar role se fornecido
    if (role) {
      updateData.role = role;
      updateData.permissions = getDefaultPermissions(role);
    }
    
    // Só atualizar status se fornecido
    if (typeof isActive === 'boolean') {
      updateData.is_active = isActive;
    }
    
    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar usuário',
        error: error.message
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        profile: user.profile || {}
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Deletar usuário
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.organization?.id;
    
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organização não identificada'
      });
    }
    
    // Não permitir deletar o próprio usuário
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar seu próprio usuário'
      });
    }
    
    const { data: user, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao deletar usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao deletar usuário',
        error: error.message
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter estatísticas de usuários
const getUserStats = async (req, res) => {
  try {
    const organizationId = req.organization?.id;
    
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organização não identificada'
      });
    }

    // Buscar estatísticas dos usuários
    const { data: users, error } = await supabase
      .from('users')
      .select('role, is_active')
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Erro ao buscar estatísticas de usuários:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas',
        error: error.message
      });
    }

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.is_active).length,
      inactiveUsers: users.filter(u => !u.is_active).length,
      byRole: {
        admin: users.filter(u => u.role === 'admin').length,
        dentist: users.filter(u => u.role === 'dentist').length,
        secretary: users.filter(u => u.role === 'secretary').length
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getUserStats
};

const User = require('../models/User');
const { getDefaultPermissions } = require('../middleware/organizationAuth');

// Verificar se está conectado ao MongoDB
const isConnectedToDB = () => {
  return process.env.MONGODB_URI && require('mongoose').connection.readyState === 1;
};

// Dados mockados para modo demo
const mockUsers = [
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'Dr. João Silva',
    email: 'joao.silva@clinica.com',
    organization: { role: 'dentist' },
    isActive: true,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    lastLogin: new Date('2024-12-29T08:30:00Z'),
    profile: { cro: '12345-SP', specialty: 'Ortodontia' }
  },
  {
    _id: '507f1f77bcf86cd799439012',
    name: 'Maria Santos',
    email: 'maria.santos@clinica.com',
    organization: { role: 'secretary' },
    isActive: true,
    createdAt: new Date('2024-02-20T14:20:00Z'),
    lastLogin: new Date('2024-12-28T16:45:00Z'),
    profile: {}
  },
  {
    _id: '507f1f77bcf86cd799439013',
    name: 'Admin Sistema',
    email: 'admin@clinica.com',
    organization: { role: 'admin' },
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    lastLogin: new Date('2024-12-29T09:15:00Z'),
    profile: {}
  }
];

// Listar usuários da organização
const getUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    let users;
    
    if (isConnectedToDB()) {
      let filter = { 'organization.id': req.organization._id };
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (role && role !== 'all') {
        filter['organization.role'] = role;
      }
      
      if (status && status !== 'all') {
        filter.isActive = status === 'active';
      }
      
      users = await User.find(filter, { password: 0 }).sort({ createdAt: -1 });
    } else {
      users = [...mockUsers];
      
      if (search) {
        const searchTerm = search.toLowerCase();
        users = users.filter(user =>
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm)
        );
      }
      
      if (role && role !== 'all') {
        users = users.filter(user => user.organization.role === role);
      }
      
      if (status && status !== 'all') {
        const isActive = status === 'active';
        users = users.filter(user => user.isActive === isActive);
      }
      
      users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    res.json({
      success: true,
      total: users.length,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.organization.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        profile: user.profile
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuários',
      error: error.message
    });
  }
};

// Criar usuário na organização
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, profile } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email, senha e função são obrigatórios'
      });
    }
    
    // Verificar limite de usuários
    const currentUsers = await User.countDocuments({
      'organization.id': req.organization._id,
      isActive: true
    });
    
    if (currentUsers >= req.organization.subscription.maxUsers) {
      return res.status(400).json({
        success: false,
        message: `Limite de usuários atingido (${req.organization.subscription.maxUsers})`
      });
    }
    
    // Verificar se email já existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este email já está sendo usado'
      });
    }
    
    // Criar usuário
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      organization: {
        id: req.organization._id,
        role,
        permissions: getDefaultPermissions(role),
        joinedAt: new Date(),
        createdBy: req.user._id
      },
      profile: profile || {},
      isActive: true
    });
    
    const userResponse = await User.findById(newUser._id).select('-password');
    
    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: userResponse._id,
        name: userResponse.name,
        email: userResponse.email,
        role: userResponse.organization.role,
        isActive: userResponse.isActive,
        createdAt: userResponse.createdAt,
        profile: userResponse.profile
      }
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário',
      error: error.message
    });
  }
};

// Buscar usuário por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    let user;
    if (isConnectedToDB()) {
      user = await User.findOne({
        _id: id,
        'organization.id': req.organization._id
      }, { password: 0 });
    } else {
      user = mockUsers.find(u => u._id === id);
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
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.organization.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário',
      error: error.message
    });
  }
};

// Atualizar usuário
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive, profile } = req.body;
    
    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e função são obrigatórios'
      });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        'organization.role': role,
        'organization.permissions': getDefaultPermissions(role),
        profile: profile || {},
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.organization.role,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        profile: updatedUser.profile
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário',
      error: error.message
    });
  }
};

// Toggle status do usuário
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findOne({
      _id: id,
      'organization.id': req.organization._id
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({
      success: true,
      message: `Usuário ${user.isActive ? 'ativado' : 'desativado'} com sucesso`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.organization.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar status do usuário',
      error: error.message
    });
  }
};

module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  toggleUserStatus
};

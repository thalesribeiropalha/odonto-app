const Organization = require('../models/Organization');
const User = require('../models/User');
const { getAllPermissions, getDefaultPermissions } = require('../middleware/organizationAuth');

// Criar nova organização (durante registro)
const createOrganization = async (req, res) => {
  try {
    const { name, document, email, phone, address } = req.body;
    
    // Validações básicas
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nome e email da organização são obrigatórios'
      });
    }
    
    // Verificar se já existe organização com este email
    const existingOrg = await Organization.findOne({ email: email.toLowerCase() });
    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma organização com este email'
      });
    }
    
    // Gerar slug único
    let baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    // Verificar se slug já existe e gerar um único
    while (await Organization.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    // Criar organização
    const organization = await Organization.create({
      name: name.trim(),
      slug,
      document: document?.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      address: address || {},
      createdBy: req.user._id,
      subscription: {
        plan: 'starter',
        maxUsers: 5,
        maxPatients: 100,
        features: ['basic'],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        isActive: true
      }
    });
    
    // Atualizar usuário como owner da organização
    await User.findByIdAndUpdate(req.user._id, {
      'organization.id': organization._id,
      'organization.role': 'owner',
      'organization.permissions': getAllPermissions(),
      'organization.joinedAt': new Date()
    });
    
    res.status(201).json({
      success: true,
      message: 'Organização criada com sucesso',
      organization: {
        id: organization._id,
        name: organization.name,
        slug: organization.slug,
        email: organization.email,
        subscription: organization.subscription
      }
    });
  } catch (error) {
    console.error('Erro ao criar organização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar organização',
      error: error.message
    });
  }
};

// Obter dados da organização atual
const getOrganization = async (req, res) => {
  try {
    const organization = req.organization;
    
    // Contar usuários ativos
    const activeUsers = await User.countDocuments({
      'organization.id': organization._id,
      isActive: true
    });
    
    res.json({
      success: true,
      organization: {
        id: organization._id,
        name: organization.name,
        slug: organization.slug,
        document: organization.document,
        email: organization.email,
        phone: organization.phone,
        address: organization.address,
        settings: organization.settings,
        subscription: organization.subscription,
        createdAt: organization.createdAt,
        stats: {
          activeUsers,
          maxUsers: organization.subscription.maxUsers,
          usagePercentage: Math.round((activeUsers / organization.subscription.maxUsers) * 100)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar organização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados da organização',
      error: error.message
    });
  }
};

// Atualizar configurações da organização
const updateOrganization = async (req, res) => {
  try {
    const { name, document, email, phone, address, settings } = req.body;
    const organizationId = req.organization._id;
    
    // Validações básicas
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nome e email são obrigatórios'
      });
    }
    
    // Verificar se email já existe em outra organização
    const existingOrg = await Organization.findOne({ 
      email: email.toLowerCase(),
      _id: { $ne: organizationId }
    });
    
    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: 'Este email já está sendo usado por outra organização'
      });
    }
    
    // Atualizar organização
    const updatedOrganization = await Organization.findByIdAndUpdate(
      organizationId,
      {
        name: name.trim(),
        document: document?.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim(),
        address: address || {},
        settings: settings || {}
      },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Organização atualizada com sucesso',
      organization: {
        id: updatedOrganization._id,
        name: updatedOrganization.name,
        slug: updatedOrganization.slug,
        document: updatedOrganization.document,
        email: updatedOrganization.email,
        phone: updatedOrganization.phone,
        address: updatedOrganization.address,
        settings: updatedOrganization.settings
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar organização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar organização',
      error: error.message
    });
  }
};

// Criar usuário na organização (SIMPLIFICADO)
const createOrganizationUser = async (req, res) => {
  try {
    const { name, email, password, role, profile } = req.body;
    
    // Validações básicas
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
    
    // Criar usuário diretamente na organização
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
    
    // Retornar usuário sem senha
    const userResponse = await User.findById(newUser._id).select('-password');
    
    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: userResponse._id,
        name: userResponse.name,
        email: userResponse.email,
        role: userResponse.organization.role,
        permissions: userResponse.organization.permissions,
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

// Listar usuários da organização
const getOrganizationUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    
    // Filtro base: sempre pela organização
    let filter = {
      'organization.id': req.organization._id
    };
    
    // Aplicar filtros adicionais
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
    
    const users = await User.find(filter, {
      password: 0 // Nunca retornar senhas
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      total: users.length,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.organization.role,
        permissions: user.organization.permissions,
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

module.exports = {
  createOrganization,
  getOrganization,
  updateOrganization,
  createOrganizationUser,
  getOrganizationUsers
};

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { getAllPermissions } = require('../middleware/organizationAuth');
const bcrypt = require('bcrypt');

// Importar sistema de usuários em memória compartilhado
const { usersInMemory, addUserToMemory } = require('../middleware/auth');

// Gerar JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret-key', {
    expiresIn: '14d',
  });
};

// Helper para modo demo (sem MongoDB)
const isDemoMode = () => !process.env.MONGODB_URI;

// Hash de senha para modo demo
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Comparar senha para modo demo
const comparePassword = async (candidatePassword, hash) => {
  return bcrypt.compare(candidatePassword, hash);
};

// Registrar usuário
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (isDemoMode()) {
      // MODO DEMO - Em memória
      console.log('📝 Registrando usuário em modo demo:', email);
      
      // Verificar se usuário já existe
      const userExists = usersInMemory.find(u => u.email === email);
      if (userExists) {
        return res.status(400).json({
          message: 'Usuário já existe com este email'
        });
      }

      // Criar usuário em memória
      const hashedPassword = await hashPassword(password);
      const newUser = {
        _id: `demo_${Date.now()}`,
        name,
        email,
        password: hashedPassword,
        role: role || 'admin',
        createdAt: new Date(),
        lastLogin: null
      };

      usersInMemory.push(newUser);
      console.log(`✅ Usuário ${email} criado com sucesso em modo demo!`);

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token: generateToken(newUser._id),
        message: 'Usuário criado com sucesso! (Modo Demo)'
      });
    } else {
      // MODO MONGODB
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          message: 'Usuário já existe com este email'
        });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role || 'admin'
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
          message: 'Usuário criado com sucesso!'
        });
      } else {
        res.status(400).json({
          message: 'Dados de usuário inválidos'
        });
      }
    }
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

    // Verificar se email e senha foram fornecidos
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email e senha são obrigatórios'
      });
    }

    if (isDemoMode()) {
      // MODO DEMO - Em memória
      console.log('🔑 Tentativa de login em modo demo:', email);
      
      const user = usersInMemory.find(u => u.email === email);
      
      if (user && (await comparePassword(password, user.password))) {
        // Atualizar último login
        user.lastLogin = new Date();
        console.log(`✅ Login bem-sucedido para ${email} em modo demo!`);

        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
          message: 'Login realizado com sucesso! (Modo Demo)'
        });
      } else {
        console.log(`❌ Credenciais inválidas para ${email} em modo demo`);
        res.status(401).json({
          message: 'Credenciais inválidas'
        });
      }
    } else {
      // MODO MONGODB
      const user = await User.findOne({ email }).select('+password');

      if (user && (await user.comparePassword(password))) {
        // Atualizar último login
        user.lastLogin = new Date();
        await user.save();

        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
          message: 'Login realizado com sucesso!'
        });
      } else {
        res.status(401).json({
          message: 'Credenciais inválidas'
        });
      }
    }
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
    if (isDemoMode()) {
      // MODO DEMO - Em memória
      const user = usersInMemory.find(u => u._id === req.user.id);
      
      if (user) {
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        });
      } else {
        res.status(404).json({
          message: 'Usuário não encontrado (Modo Demo)'
        });
      }
    } else {
      // MODO MONGODB
      const user = await User.findById(req.user.id);
      
      if (user) {
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        });
      } else {
        res.status(404).json({
          message: 'Usuário não encontrado'
        });
      }
    }
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
      // Dados do usuário
      name, 
      email, 
      password,
      // Dados da organização
      organizationName,
      organizationDocument,
      organizationEmail,
      organizationPhone,
      organizationAddress
    } = req.body;

    // Validações básicas
    if (!name || !email || !password || !organizationName) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email, senha e nome da organização são obrigatórios'
      });
    }

    if (!isDemoMode()) {
      // Verificar se usuário já existe
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'Usuário já existe com este email'
        });
      }

      // Verificar se organização já existe
      const orgExists = await Organization.findOne({ 
        email: organizationEmail?.toLowerCase() || email.toLowerCase() 
      });
      if (orgExists) {
        return res.status(400).json({
          success: false,
          message: 'Já existe uma organização com este email'
        });
      }

      // Criar usuário primeiro (sem organização)
      const tempUser = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        organization: {
          id: null, // Será preenchido depois
          role: 'owner',
          permissions: getAllPermissions(),
          joinedAt: new Date()
        },
        isActive: true
      });

      // Gerar slug único para a organização
      let baseSlug = organizationName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      let slug = baseSlug;
      let counter = 1;
      
      while (await Organization.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Criar organização
      const organization = await Organization.create({
        name: organizationName.trim(),
        slug,
        document: organizationDocument?.trim(),
        email: (organizationEmail || email).toLowerCase().trim(),
        phone: organizationPhone?.trim(),
        address: organizationAddress || {},
        createdBy: tempUser._id,
        subscription: {
          plan: 'starter',
          maxUsers: 5,
          maxPatients: 100,
          features: ['basic'],
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
          isActive: true
        }
      });

      // Atualizar usuário com a organização
      await User.findByIdAndUpdate(tempUser._id, {
        'organization.id': organization._id
      });

      // Buscar usuário atualizado
      const user = await User.findById(tempUser._id).select('-password');

      res.status(201).json({
        success: true,
        message: 'Usuário e organização criados com sucesso!',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.organization.role,
          token: generateToken(user._id)
        },
        organization: {
          id: organization._id,
          name: organization.name,
          slug: organization.slug
        }
      });
    } else {
      // Modo demo - criar organização mockada
      const hashedPassword = await hashPassword(password);
      const newUser = {
        _id: `demo_${Date.now()}`,
        name,
        email,
        password: hashedPassword,
        organization: {
          id: `org_demo_${Date.now()}`,
          role: 'owner'
        },
        createdAt: new Date(),
        lastLogin: null
      };

      usersInMemory.push(newUser);

      res.status(201).json({
        success: true,
        message: 'Usuário e organização criados com sucesso! (Modo Demo)',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.organization.role,
          token: generateToken(newUser._id)
        },
        organization: {
          id: newUser.organization.id,
          name: organizationName
        }
      });
    }
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

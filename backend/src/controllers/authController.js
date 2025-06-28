const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Sistema de usuários em memória para demonstração (quando não há MongoDB)
let usersInMemory = [];

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

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};

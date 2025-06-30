const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [50, 'Nome não pode ter mais de 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres']
  },
  // **ESTRUTURA ORGANIZACIONAL**
  organization: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Usuário deve pertencer a uma organização']
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'dentist', 'secretary'],
      required: [true, 'Função na organização é obrigatória']
    },
    permissions: [{
      type: String,
      enum: [
        'users.create', 'users.read', 'users.update', 'users.delete',
        'patients.create', 'patients.read', 'patients.update', 'patients.delete',
        'appointments.create', 'appointments.read', 'appointments.update', 'appointments.delete',
        'financial.create', 'financial.read', 'financial.update', 'financial.delete',
        'reports.read', 'settings.update', 'organization.manage'
      ]
    }],
    joinedAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Configurações pessoais
  preferences: {
    language: {
      type: String,
      default: 'pt-BR'
    },
    timezone: {
      type: String,
      default: 'America/Sao_Paulo'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Perfil profissional
  profile: {
    cro: {
      type: String,
      trim: true,
      maxLength: [20, 'CRO não pode ter mais de 20 caracteres']
    },
    specialty: {
      type: String,
      trim: true,
      maxLength: [100, 'Especialidade não pode ter mais de 100 caracteres']
    },
    phone: {
      type: String,
      trim: true,
      maxLength: [20, 'Telefone não pode ter mais de 20 caracteres']
    },
    bio: {
      type: String,
      trim: true,
      maxLength: [500, 'Bio não pode ter mais de 500 caracteres']
    }
  },
  
  // Controle
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para remover senha dos dados retornados
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);

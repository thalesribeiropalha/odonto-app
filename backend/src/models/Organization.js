const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome da organização é obrigatório'],
    trim: true,
    maxLength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  // Informações da empresa
  document: {
    type: String,
    trim: true,
    maxLength: [20, 'Documento não pode ter mais de 20 caracteres']
  },
  
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  
  phone: {
    type: String,
    trim: true,
    maxLength: [20, 'Telefone não pode ter mais de 20 caracteres']
  },
  
  // Endereço
  address: {
    street: {
      type: String,
      trim: true,
      maxLength: [200, 'Endereço não pode ter mais de 200 caracteres']
    },
    city: {
      type: String,
      trim: true,
      maxLength: [100, 'Cidade não pode ter mais de 100 caracteres']
    },
    state: {
      type: String,
      trim: true,
      maxLength: [50, 'Estado não pode ter mais de 50 caracteres']
    },
    zipCode: {
      type: String,
      trim: true,
      maxLength: [20, 'CEP não pode ter mais de 20 caracteres']
    },
    country: {
      type: String,
      trim: true,
      maxLength: [50, 'País não pode ter mais de 50 caracteres'],
      default: 'Brasil'
    }
  },
  
  // Configurações do consultório
  settings: {
    timezone: {
      type: String,
      default: 'America/Sao_Paulo'
    },
    currency: {
      type: String,
      default: 'BRL'
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    },
    businessHours: {
      monday: { 
        start: { type: String, default: '08:00' }, 
        end: { type: String, default: '18:00' }, 
        active: { type: Boolean, default: true } 
      },
      tuesday: { 
        start: { type: String, default: '08:00' }, 
        end: { type: String, default: '18:00' }, 
        active: { type: Boolean, default: true } 
      },
      wednesday: { 
        start: { type: String, default: '08:00' }, 
        end: { type: String, default: '18:00' }, 
        active: { type: Boolean, default: true } 
      },
      thursday: { 
        start: { type: String, default: '08:00' }, 
        end: { type: String, default: '18:00' }, 
        active: { type: Boolean, default: true } 
      },
      friday: { 
        start: { type: String, default: '08:00' }, 
        end: { type: String, default: '18:00' }, 
        active: { type: Boolean, default: true } 
      },
      saturday: { 
        start: { type: String, default: '08:00' }, 
        end: { type: String, default: '12:00' }, 
        active: { type: Boolean, default: false } 
      },
      sunday: { 
        start: { type: String, default: '08:00' }, 
        end: { type: String, default: '12:00' }, 
        active: { type: Boolean, default: false } 
      }
    },
    
    // Personalizações
    theme: {
      primaryColor: {
        type: String,
        default: '#007bff'
      },
      logo: String,
      favicon: String
    }
  },
  
  // Plano e limites
  subscription: {
    plan: {
      type: String,
      enum: ['starter', 'professional', 'enterprise'],
      default: 'starter'
    },
    maxUsers: {
      type: Number,
      default: 5
    },
    maxPatients: {
      type: Number,
      default: 100
    },
    features: [{
      type: String,
      enum: ['basic', 'agendamento', 'financeiro', 'relatorios', 'backup']
    }],
    expiresAt: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  
  // Controle
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Middleware para gerar slug automaticamente
organizationSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-|-$/g, ''); // Remove hífens no início e fim
  }
  next();
});

// Índices
organizationSchema.index({ slug: 1 });
organizationSchema.index({ createdBy: 1 });
organizationSchema.index({ 'subscription.isActive': 1 });

module.exports = mongoose.model('Organization', organizationSchema);

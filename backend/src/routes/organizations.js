const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { organizationAuth } = require('../middleware/organizationAuth');
const {
  createOrganization,
  getOrganization,
  updateOrganization,
  createOrganizationUser,
  getOrganizationUsers
} = require('../controllers/organizationController');

// Todas as rotas requerem autenticação
router.use(protect);

// GET /api/organizations - Listar todas organizações (apenas admin)
router.get('/', (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Apenas administradores podem listar todas organizações'
    });
  }
  
  // Retornar dados mock para admin
  res.json({
    success: true,
    organizations: [
      {
        _id: '1',
        name: 'Clínica Exemplo',
        email: 'contato@clinica.com',
        isActive: true,
        subscription: { plan: 'starter' },
        createdAt: new Date()
      }
    ]
  });
});

// GET /api/organizations/my - Obter minha organização (owner)
router.get('/my', organizationAuth, getOrganization);

// GET /api/organizations/my/stats - Estatísticas da minha organização
router.get('/my/stats', organizationAuth, (req, res) => {
  res.json({
    success: true,
    stats: {
      activeUsers: 2,
      maxUsers: 5,
      totalPatients: 25
    }
  });
});

// POST /api/organizations - Criar nova organização (admin)
router.post('/', (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Apenas administradores podem criar organizações'
    });
  }
  createOrganization(req, res);
});

// PUT /api/organizations/:id - Atualizar organização
router.put('/:id', organizationAuth, updateOrganization);

module.exports = router;

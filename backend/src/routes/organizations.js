const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { organizationAuth } = require('../middleware/organizationAuth');
const {
  createOrganization,
  getOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  toggleOrganizationStatus
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
  getOrganizations(req, res);
});

// GET /api/organizations/my - Obter minha organização (owner)
router.get('/my', organizationAuth, (req, res) => {
  req.params.id = req.user.organizationId;
  getOrganization(req, res);
});

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

// GET /api/organizations/:id - Obter organização específica
router.get('/:id', getOrganization);

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

// DELETE /api/organizations/:id - Deletar organização (apenas admin)
router.delete('/:id', (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Apenas administradores podem deletar organizações'
    });
  }
  deleteOrganization(req, res);
});

// PATCH /api/organizations/:id/toggle-status - Ativar/Desativar organização (apenas admin)
router.patch('/:id/toggle-status', (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Apenas administradores podem alterar status de organizações'
    });
  }
  toggleOrganizationStatus(req, res);
});

module.exports = router;

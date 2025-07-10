const express = require('express');
const router = express.Router();
const { protect, hasOwnerAccess, hasAdminAccess, validateOrganizationAccess } = require('../middleware/auth');
const { organizationAuth } = require('../middleware/organizationAuth');
const {
  createOrganization,
  getOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  toggleOrganizationStatus,
  getSystemStats
} = require('../controllers/organizationController');

// Todas as rotas requerem autenticação
router.use(protect);

// GET /api/organizations/stats - Estatísticas do sistema (apenas proprietário)
router.get('/stats', hasOwnerAccess, getSystemStats);

// GET /api/organizations - Listar todas organizações (apenas proprietário)
router.get('/', hasOwnerAccess, getOrganizations);

// GET /api/organizations/my - Obter minha organização (admin+)
router.get('/my', validateOrganizationAccess, organizationAuth, hasAdminAccess, (req, res) => {
  req.params.id = req.user.organizationId;
  getOrganization(req, res);
});

// GET /api/organizations/my/stats - Estatísticas da minha organização (admin+)
router.get('/my/stats', validateOrganizationAccess, organizationAuth, hasAdminAccess, (req, res) => {
  res.json({
    success: true,
    stats: {
      activeUsers: 2,
      maxUsers: 5,
      totalPatients: 25
    }
  });
});

// GET /api/organizations/:id - Obter organização específica (proprietário)
router.get('/:id', hasOwnerAccess, getOrganization);

// POST /api/organizations - Criar nova organização (apenas proprietário)
router.post('/', hasOwnerAccess, createOrganization);

// PUT /api/organizations/:id - Atualizar organização (admin da própria org)
router.put('/:id', validateOrganizationAccess, organizationAuth, hasAdminAccess, updateOrganization);

// DELETE /api/organizations/:id - Deletar organização (apenas proprietário)
router.delete('/:id', hasOwnerAccess, deleteOrganization);

// PATCH /api/organizations/:id/toggle-status - Ativar/Desativar organização (apenas proprietário)
router.patch('/:id/toggle-status', hasOwnerAccess, toggleOrganizationStatus);

module.exports = router;


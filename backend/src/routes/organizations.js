const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireOrganization, requirePermission } = require('../middleware/organizationAuth');
const {
  getAllOrganizations,
  getMyOrganization,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  toggleOrganizationStatus,
  getOrganizationStats
} = require('../controllers/organizationController');

// Rotas para organizações
// Todas as rotas requerem autenticação
router.use(protect);

// GET /api/organizations - Listar todas organizações (apenas admin)
router.get('/', requirePermission(['admin']), getAllOrganizations);

// GET /api/organizations/my - Obter minha organização (owner)
router.get('/my', requireOrganization, getMyOrganization);

// GET /api/organizations/my/stats - Estatísticas da minha organização
router.get('/my/stats', requireOrganization, getOrganizationStats);

// GET /api/organizations/:id - Obter organização por ID (admin)
router.get('/:id', requirePermission(['admin']), getOrganizationById);

// GET /api/organizations/:id/stats - Estatísticas de organização específica (admin)
router.get('/:id/stats', requirePermission(['admin']), (req, res, next) => {
  req.params.orgId = req.params.id;
  getOrganizationStats(req, res, next);
});

// POST /api/organizations - Criar nova organização (admin)
router.post('/', requirePermission(['admin']), createOrganization);

// PUT /api/organizations/:id - Atualizar organização
router.put('/:id', requireOrganization, updateOrganization);

// PATCH /api/organizations/:id/toggle-status - Ativar/Desativar organização
router.patch('/:id/toggle-status', requirePermission(['admin', 'owner']), toggleOrganizationStatus);

// PATCH /api/organizations/:id/plan - Atualizar plano da organização (admin)
router.patch('/:id/plan', requirePermission(['admin']), updateOrganization);

// DELETE /api/organizations/:id - Deletar organização (admin)
router.delete('/:id', requirePermission(['admin']), deleteOrganization);

module.exports = router;

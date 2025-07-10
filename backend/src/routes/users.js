const express = require('express');
const router = express.Router();
const { protect, hasAdminAccess, validateOrganizationAccess } = require('../middleware/auth');
const { organizationAuth } = require('../middleware/organizationAuth');
const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getUserStats
} = require('../controllers/userController');

// Todas as rotas protegidas por autenticação
router.use(protect);
router.use(validateOrganizationAccess);
router.use(organizationAuth);

// Aplicar controle de acesso administrativo para todas as rotas de usuários
router.use(hasAdminAccess);

// GET /api/users/stats - Obter estatísticas de usuários (admin+)
router.get('/stats', getUserStats);

// GET /api/users - Listar usuários da organização (admin+)
router.get('/', getUsers);

// POST /api/users - Criar novo usuário (admin+)
router.post('/', createUser);

// GET /api/users/:id - Buscar usuário específico (admin+)
router.get('/:id', getUser);

// PUT /api/users/:id - Atualizar usuário (admin+)
router.put('/:id', updateUser);

// DELETE /api/users/:id - Deletar usuário (admin+)
router.delete('/:id', deleteUser);

module.exports = router;


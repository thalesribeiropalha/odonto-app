const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { organizationAuth, canManageUsers } = require('../middleware/organizationAuth');
const {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  toggleUserStatus
} = require('../controllers/userController');

// Todas as rotas protegidas por autenticação e organização
router.use(auth);
router.use(organizationAuth);

// GET /api/users - Listar usuários da organização
router.get('/', getUsers);

// POST /api/users - Criar novo usuário (apenas admin/owner)
router.post('/', canManageUsers, createUser);

// GET /api/users/:id - Buscar usuário específico
router.get('/:id', getUserById);

// PUT /api/users/:id - Atualizar usuário (apenas admin/owner)
router.put('/:id', canManageUsers, updateUser);

// PATCH /api/users/:id/toggle-status - Ativar/desativar usuário (apenas admin/owner)
router.patch('/:id/toggle-status', canManageUsers, toggleUserStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { organizationAuth, canManageUsers } = require('../middleware/organizationAuth');
const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// Todas as rotas protegidas por autenticação e organização
router.use(protect);
router.use(organizationAuth);

// GET /api/users - Listar usuários da organização
router.get('/', getUsers);

// POST /api/users - Criar novo usuário (apenas admin/owner)
router.post('/', canManageUsers, createUser);

// GET /api/users/:id - Buscar usuário específico
router.get('/:id', getUser);

// PUT /api/users/:id - Atualizar usuário (apenas admin/owner)
router.put('/:id', canManageUsers, updateUser);

// DELETE /api/users/:id - Deletar usuário (apenas admin/owner)
router.delete('/:id', canManageUsers, deleteUser);

module.exports = router;

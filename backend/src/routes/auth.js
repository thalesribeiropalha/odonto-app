const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  registerWithOrganization
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Rota de registro simples
router.post('/register', registerUser);

// Rota de registro com organização
router.post('/register-organization', registerWithOrganization);

// Rota de login
router.post('/login', loginUser);

// Rota de perfil (protegida)
router.get('/profile', protect, getUserProfile);

// Rota para verificar se token é válido
router.get('/verify', protect, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;

const express = require('express');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

const router = express.Router();

// Endpoint para testar autenticação
router.get('/test-auth', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.json({
        success: false,
        message: 'Nenhum header Authorization encontrado',
        headers: req.headers
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.json({
        success: false,
        message: 'Header Authorization não começa com Bearer',
        authHeader
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.json({
        success: false,
        message: 'Token não encontrado após Bearer',
        authHeader
      });
    }

    // Verificar JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    
    try {
      const decoded = jwt.verify(token, jwtSecret);
      
      // Buscar usuário
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, role, organization_id, permissions, is_active')
        .eq('id', decoded.id)
        .eq('is_active', true)
        .single();

      if (error) {
        return res.json({
          success: false,
          message: 'Erro ao buscar usuário no Supabase',
          error: error.message,
          decoded,
          jwtSecret: jwtSecret.substring(0, 10) + '...'
        });
      }

      if (!user) {
        return res.json({
          success: false,
          message: 'Usuário não encontrado',
          decoded,
          jwtSecret: jwtSecret.substring(0, 10) + '...'
        });
      }

      res.json({
        success: true,
        message: 'Token válido!',
        decoded,
        user,
        jwtSecret: jwtSecret.substring(0, 10) + '...'
      });

    } catch (jwtError) {
      res.json({
        success: false,
        message: 'Erro ao verificar JWT',
        error: jwtError.message,
        token: token.substring(0, 20) + '...',
        jwtSecret: jwtSecret.substring(0, 10) + '...'
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno',
      error: error.message
    });
  }
});

module.exports = router;

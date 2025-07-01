const express = require('express');
const { supabase, testConnection } = require('../config/supabase');

const router = express.Router();

// Testar conexão com Supabase
router.get('/connection', async (req, res) => {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      res.json({
        success: true,
        message: 'Conexão com Supabase funcionando!',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Falha na conexão com Supabase'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao testar conexão',
      error: error.message
    });
  }
});

// Testar busca de dados
router.get('/data', async (req, res) => {
  try {
    // Buscar organizações
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(5);

    if (orgError) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar organizações',
        error: orgError.message
      });
    }

    // Buscar usuários
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (userError) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar usuários',
        error: userError.message
      });
    }

    res.json({
      success: true,
      data: {
        organizations: organizations || [],
        users: users || [],
        totalOrganizations: organizations?.length || 0,
        totalUsers: users?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados',
      error: error.message
    });
  }
});

module.exports = router;

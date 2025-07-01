const express = require('express');
const bcrypt = require('bcrypt');
const { supabase, supabaseAdmin } = require('../config/supabase');

const router = express.Router();

// Rota temporária para corrigir senha do admin
router.post('/fix-admin-password', async (req, res) => {
  try {
    // Gerar novo hash da senha
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Tentando atualizar senha do admin...');
    console.log('Novo hash:', hashedPassword);
    
    // Usar o cliente administrativo para bypass RLS
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', 'admin@clinicademo.com')
      .select();

    if (error) {
      console.error('Erro ao atualizar senha:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar senha',
        error: error.message
      });
    }

    console.log('Senha atualizada com sucesso:', data);
    
    res.json({
      success: true,
      message: 'Senha do admin atualizada com sucesso!',
      newHash: hashedPassword
    });
    
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Rota para testar login do admin
router.post('/test-admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuário
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, password, role, is_active')
      .eq('email', email || 'admin@clinicademo.com')
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
        error: error?.message
      });
    }

    // Se não conseguir acessar a senha, retornar info do usuário
    if (!user.password) {
      return res.json({
        success: false,
        message: 'Senha não acessível via RLS',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    // Verificar senha se disponível
    const isPasswordValid = await bcrypt.compare(password || 'admin123', user.password);
    
    res.json({
      success: isPasswordValid,
      message: isPasswordValid ? 'Login válido!' : 'Senha incorreta',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

module.exports = router;

// Vercel Serverless Function for Login
const { supabase } = require('../../backend/src/config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário no Supabase
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true);

    if (fetchError) {
      console.error('Erro ao buscar usuário:', fetchError);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar usuário no banco de dados'
      });
    }

    const user = users?.[0];
    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'odonto-app-secret-key-2025',
      { expiresIn: '14d' }
    );

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      ...userWithoutPassword,
      token,
      message: 'Login realizado com sucesso!'
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro inesperado no servidor'
    });
  }
}


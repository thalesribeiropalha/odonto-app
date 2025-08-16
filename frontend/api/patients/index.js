// Vercel Serverless Function for Patients API
const { supabase } = require('../../../backend/src/config/supabase');
const jwt = require('jsonwebtoken');

// Auth middleware
async function authenticate(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token não fornecido');
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'odonto-app-secret-key-2025');
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      throw new Error('Token inválido');
    }

    return user;
  } catch (error) {
    throw new Error('Token inválido');
  }
}

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

  try {
    // Authenticate user
    const user = await authenticate(req);

    if (req.method === 'GET') {
      // Get patients
      const { page = 1, limit = 10, search = '' } = req.query;
      
      let query = supabase
        .from('patients')
        .select('*')
        .eq('organization_id', user.organization_id)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`name.ilike.%${search}%,document.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data: patients, error } = await query;

      if (error) {
        return res.status(500).json({ error: 'Erro ao buscar pacientes' });
      }

      return res.status(200).json({
        success: true,
        patients: patients || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: patients?.length || 0,
          totalPages: Math.ceil((patients?.length || 0) / parseInt(limit))
        }
      });
    }

    if (req.method === 'POST') {
      // Create patient
      const patientData = {
        ...req.body,
        organization_id: user.organization_id,
        created_by: user.id
      };

      const { data: patient, error } = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: 'Erro ao criar paciente' });
      }

      return res.status(201).json({
        success: true,
        patient,
        message: 'Paciente criado com sucesso!'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Erro na API de pacientes:', error);
    
    if (error.message.includes('Token')) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'O token de acesso fornecido é inválido. Faça login novamente.'
      });
    }

    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message || 'Erro inesperado no servidor'
    });
  }
}


const { supabaseAdmin } = require('../config/supabase');

// Buscar pacientes da organização
const getPatients = async (req, res) => {
  try {
    const { organization_id } = req.user;
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      gender = '', 
      active = '' 
    } = req.query;

    let query = supabaseAdmin
      .from('patients')
      .select(`
        *,
        created_by:created_by (name)
      `)
      .eq('organization_id', organization_id)
      .order('created_at', { ascending: false });

    // Filtro de busca (nome, documento, telefone, email)
    if (search) {
      query = query.or(`
        name.ilike.%${search}%,
        document.ilike.%${search}%,
        phone.ilike.%${search}%,
        email.ilike.%${search}%
      `);
    }

    // Filtro por gênero
    if (gender) {
      query = query.eq('gender', gender);
    }

    // Filtro por status ativo
    if (active !== '') {
      query = query.eq('is_active', active === 'true');
    }

    // Paginação
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: patients, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar pacientes:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar pacientes',
        error: error.message
      });
    }

    res.json({
      success: true,
      patients: patients || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Buscar paciente por ID
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const { organization_id } = req.user;

    const { data: patient, error } = await supabaseAdmin
      .from('patients')
      .select(`
        *,
        created_by:created_by (name, email)
      `)
      .eq('id', id)
      .eq('organization_id', organization_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Paciente não encontrado'
        });
      }
      console.error('Erro ao buscar paciente:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }

    res.json({
      success: true,
      patient
    });

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Criar novo paciente
const createPatient = async (req, res) => {
  try {
    const { organization_id, id: user_id } = req.user;
    const patientData = {
      ...req.body,
      organization_id,
      created_by: user_id
    };

    // Validações básicas
    if (!patientData.name) {
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatório'
      });
    }

    // Verificar se documento já existe na organização (se fornecido)
    if (patientData.document) {
      const { data: existingPatient } = await supabaseAdmin
        .from('patients')
        .select('id')
        .eq('organization_id', organization_id)
        .eq('document', patientData.document)
        .single();

      if (existingPatient) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um paciente cadastrado com este CPF'
        });
      }
    }

    // Verificar se email já existe na organização (se fornecido)
    if (patientData.email) {
      const { data: existingEmail } = await supabaseAdmin
        .from('patients')
        .select('id')
        .eq('organization_id', organization_id)
        .eq('email', patientData.email)
        .single();

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um paciente cadastrado com este email'
        });
      }
    }

    const { data: patient, error } = await supabaseAdmin
      .from('patients')
      .insert([patientData])
      .select(`
        *,
        created_by:created_by (name)
      `)
      .single();

    if (error) {
      console.error('Erro ao criar paciente:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar paciente',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Paciente criado com sucesso',
      patient
    });

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Atualizar paciente
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { organization_id } = req.user;
    const updateData = { ...req.body };

    // Remover campos que não devem ser atualizados
    delete updateData.id;
    delete updateData.organization_id;
    delete updateData.created_by;
    delete updateData.created_at;

    // Verificar se paciente existe e pertence à organização
    const { data: existingPatient, error: checkError } = await supabaseAdmin
      .from('patients')
      .select('id, document, email')
      .eq('id', id)
      .eq('organization_id', organization_id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Paciente não encontrado'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar paciente',
        error: checkError.message
      });
    }

    // Verificar conflitos de documento (se alterado)
    if (updateData.document && updateData.document !== existingPatient.document) {
      const { data: docConflict } = await supabaseAdmin
        .from('patients')
        .select('id')
        .eq('organization_id', organization_id)
        .eq('document', updateData.document)
        .neq('id', id)
        .single();

      if (docConflict) {
        return res.status(400).json({
          success: false,
          message: 'Já existe outro paciente com este CPF'
        });
      }
    }

    // Verificar conflitos de email (se alterado)
    if (updateData.email && updateData.email !== existingPatient.email) {
      const { data: emailConflict } = await supabaseAdmin
        .from('patients')
        .select('id')
        .eq('organization_id', organization_id)
        .eq('email', updateData.email)
        .neq('id', id)
        .single();

      if (emailConflict) {
        return res.status(400).json({
          success: false,
          message: 'Já existe outro paciente com este email'
        });
      }
    }

    const { data: patient, error } = await supabaseAdmin
      .from('patients')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', organization_id)
      .select(`
        *,
        created_by:created_by (name)
      `)
      .single();

    if (error) {
      console.error('Erro ao atualizar paciente:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar paciente',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Paciente atualizado com sucesso',
      patient
    });

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Desativar/ativar paciente
const togglePatientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { organization_id } = req.user;

    // Buscar paciente atual
    const { data: currentPatient, error: fetchError } = await supabaseAdmin
      .from('patients')
      .select('is_active')
      .eq('id', id)
      .eq('organization_id', organization_id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Paciente não encontrado'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar paciente',
        error: fetchError.message
      });
    }

    // Inverter status
    const newStatus = !currentPatient.is_active;

    const { data: patient, error } = await supabaseAdmin
      .from('patients')
      .update({ is_active: newStatus })
      .eq('id', id)
      .eq('organization_id', organization_id)
      .select(`
        *,
        created_by:created_by (name)
      `)
      .single();

    if (error) {
      console.error('Erro ao alterar status:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao alterar status do paciente',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: `Paciente ${newStatus ? 'ativado' : 'desativado'} com sucesso`,
      patient
    });

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Buscar pacientes (para autocomplete)
const searchPatients = async (req, res) => {
  try {
    const { organization_id } = req.user;
    const { q = '', limit = 10 } = req.query;

    let query = supabaseAdmin
      .from('patients')
      .select('id, name, document, phone, email')
      .eq('organization_id', organization_id)
      .eq('is_active', true)
      .limit(parseInt(limit));

    if (q) {
      query = query.or(`name.ilike.%${q}%,document.ilike.%${q}%,phone.ilike.%${q}%`);
    }

    const { data: patients, error } = await query;

    if (error) {
      console.error('Erro na busca:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro na busca de pacientes',
        error: error.message
      });
    }

    res.json({
      success: true,
      patients: patients || []
    });

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Estatísticas de pacientes
const getPatientsStats = async (req, res) => {
  try {
    const { organization_id } = req.user;

    const { count: totalPatients } = await supabaseAdmin
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id);

    const { count: activePatients } = await supabaseAdmin
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id)
      .eq('is_active', true);

    const { count: malePatients } = await supabaseAdmin
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id)
      .eq('gender', 'masculino')
      .eq('is_active', true);

    const { count: femalePatients } = await supabaseAdmin
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organization_id)
      .eq('gender', 'feminino')
      .eq('is_active', true);

    res.json({
      success: true,
      stats: {
        total: totalPatients || 0,
        active: activePatients || 0,
        inactive: (totalPatients || 0) - (activePatients || 0),
        male: malePatients || 0,
        female: femalePatients || 0
      }
    });

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  togglePatientStatus,
  searchPatients,
  getPatientsStats
};









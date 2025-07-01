const { supabase } = require('../config/supabase');

// Obter permissões padrão por role
const getDefaultPermissions = (role) => {
  const permissions = {
    owner: ['users.create', 'users.read', 'users.update', 'users.delete', 'organization.manage', 'reports.read', 'settings.update'],
    admin: ['users.create', 'users.read', 'users.update', 'users.delete', 'reports.read'],
    dentist: ['users.read', 'patients.create', 'patients.read', 'patients.update', 'appointments.create', 'appointments.read', 'appointments.update'],
    secretary: ['users.read', 'patients.read', 'appointments.create', 'appointments.read', 'appointments.update']
  };
  return permissions[role] || [];
};

// Criar nova organização (durante registro)
const createOrganization = async (req, res) => {
  try {
    const { name, document, email, phone, address } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nome e email da organização são obrigatórios'
      });
    }
    
    // Verificar se já existe organização com este email
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma organização com este email'
      });
    }
    
    // Gerar slug único
    let baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    // Verificar se slug já existe e gerar um único
    while (true) {
      const { data: existingSlug } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .single();
      
      if (!existingSlug) break;
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    // Criar organização
    const { data: organization, error } = await supabase
      .from('organizations')
      .insert([{
        name: name.trim(),
        slug,
        document: document?.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim(),
        address: address || {},
        created_by: req.user.id,
        subscription: {
          plan: 'starter',
          maxUsers: 5,
          maxPatients: 100,
          features: ['basic'],
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true
        },
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar organização:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar organização',
        error: error.message
      });
    }
    
    // Atualizar usuário como owner da organização
    const { error: updateError } = await supabase
      .from('users')
      .update({
        organization_id: organization.id,
        role: 'owner',
        permissions: getDefaultPermissions('owner')
      })
      .eq('id', req.user.id);

    if (updateError) {
      console.error('Erro ao atualizar usuário:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Organização criada, mas erro ao atualizar usuário',
        error: updateError.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Organização criada com sucesso',
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        email: organization.email,
        phone: organization.phone,
        document: organization.document,
        address: organization.address,
        subscription: organization.subscription,
        isActive: organization.is_active,
        createdAt: organization.created_at
      }
    });
  } catch (error) {
    console.error('Erro ao criar organização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Listar organizações (para admin do sistema)
const getOrganizations = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    
    let query = supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    if (status && status !== 'all') {
      const isActive = status === 'active';
      query = query.eq('is_active', isActive);
    }

    // Paginação
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: organizations, error } = await query;

    if (error) {
      console.error('Erro ao buscar organizações:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar organizações',
        error: error.message
      });
    }

    res.json({
      success: true,
      total: organizations.length,
      organizations: organizations.map(org => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        email: org.email,
        phone: org.phone,
        document: org.document,
        address: org.address,
        subscription: org.subscription,
        isActive: org.is_active,
        createdAt: org.created_at,
        createdBy: org.created_by
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar organizações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter organização específica
const getOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: organization, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar organização:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar organização',
        error: error.message
      });
    }

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organização não encontrada'
      });
    }

    res.json({
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        email: organization.email,
        phone: organization.phone,
        document: organization.document,
        address: organization.address,
        subscription: organization.subscription,
        isActive: organization.is_active,
        createdAt: organization.created_at,
        createdBy: organization.created_by
      }
    });
  } catch (error) {
    console.error('Erro ao buscar organização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Atualizar organização
const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, document, email, phone, address, settings } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nome e email da organização são obrigatórios'
      });
    }
    
    // Verificar se a organização existe
    const { data: existingOrg, error: fetchError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingOrg) {
      return res.status(404).json({
        success: false,
        message: 'Organização não encontrada'
      });
    }
    
    // Verificar se já existe outra organização com este email
    const { data: emailCheck } = await supabase
      .from('organizations')
      .select('id')
      .eq('email', email.toLowerCase())
      .neq('id', id)
      .single();

    if (emailCheck) {
      return res.status(400).json({
        success: false,
        message: 'Já existe outra organização com este email'
      });
    }
    
    // Atualizar organização
    const { data: organization, error } = await supabase
      .from('organizations')
      .update({
        name: name.trim(),
        document: document?.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim(),
        address: address || existingOrg.address,
        settings: settings || existingOrg.settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar organização:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar organização',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Organização atualizada com sucesso',
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        email: organization.email,
        phone: organization.phone,
        document: organization.document,
        address: organization.address,
        settings: organization.settings,
        subscription: organization.subscription,
        isActive: organization.is_active,
        createdAt: organization.created_at,
        updatedAt: organization.updated_at
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar organização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Deletar organização
const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se a organização existe
    const { data: existingOrg, error: fetchError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingOrg) {
      return res.status(404).json({
        success: false,
        message: 'Organização não encontrada'
      });
    }
    
    // Verificar se há usuários vinculados à organização
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('organization_id', id)
      .limit(1);

    if (usersError) {
      console.error('Erro ao verificar usuários:', usersError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar usuários da organização'
      });
    }

    if (users && users.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar organização com usuários vinculados'
      });
    }
    
    // Deletar organização
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar organização:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao deletar organização',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Organização deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar organização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Ativar/Desativar organização
const toggleOrganizationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se a organização existe
    const { data: existingOrg, error: fetchError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingOrg) {
      return res.status(404).json({
        success: false,
        message: 'Organização não encontrada'
      });
    }
    
    // Alternar status
    const newStatus = !existingOrg.is_active;
    
    const { data: organization, error } = await supabase
      .from('organizations')
      .update({
        is_active: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao alterar status da organização:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao alterar status da organização',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: `Organização ${newStatus ? 'ativada' : 'desativada'} com sucesso`,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        email: organization.email,
        phone: organization.phone,
        document: organization.document,
        address: organization.address,
        subscription: organization.subscription,
        isActive: organization.is_active,
        createdAt: organization.created_at,
        updatedAt: organization.updated_at
      }
    });
  } catch (error) {
    console.error('Erro ao alterar status da organização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  createOrganization,
  getOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  toggleOrganizationStatus
};

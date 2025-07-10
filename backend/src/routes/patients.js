const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { organizationAuth } = require('../middleware/organizationAuth');
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  togglePatientStatus,
  searchPatients,
  getPatientsStats
} = require('../controllers/patientController');

// Aplicar middlewares de autenticação e organização em todas as rotas
router.use(protect);
router.use(organizationAuth);

// Rotas de pacientes

// GET /api/patients - Listar pacientes com filtros e paginação
router.get('/', getPatients);

// GET /api/patients/stats - Estatísticas de pacientes
router.get('/stats', getPatientsStats);

// GET /api/patients/search - Busca rápida para autocomplete
router.get('/search', searchPatients);

// GET /api/patients/:id - Buscar paciente específico
router.get('/:id', getPatientById);

// POST /api/patients - Criar novo paciente
router.post('/', createPatient);

// PUT /api/patients/:id - Atualizar paciente
router.put('/:id', updatePatient);

// PATCH /api/patients/:id/toggle-status - Ativar/desativar paciente
router.patch('/:id/toggle-status', togglePatientStatus);

module.exports = router;





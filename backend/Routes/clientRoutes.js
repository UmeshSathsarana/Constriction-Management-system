const express = require('express');
const {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  updateClientBudget,
  addAgreement,
  updateAgreement,
  signAgreement,
  getClientBudgetSummary,
  getClientAgreements
} = require('../controllers/clientController');

const router = express.Router();

// Basic CRUD routes
router.post('/', createClient);
router.get('/', getAllClients);
router.get('/:id', getClientById);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

// Budget management routes
router.patch('/:id/budget', updateClientBudget);
router.get('/budget/summary', getClientBudgetSummary);

// Agreement management routes
router.post('/:id/agreements', addAgreement);
router.get('/:id/agreements', getClientAgreements);
router.put('/:clientId/agreements/:agreementId', updateAgreement);
router.patch('/:clientId/agreements/:agreementId/sign', signAgreement);

module.exports = router;
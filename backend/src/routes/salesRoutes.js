const express = require('express');
const router = express.Router();
const {
  getSales,
  getSaleById,
  createSale,
  cancelSale,
  updateSale,
  deleteSale
} = require('../controllers/salesController');

// GET /api/sales          - list all sales (supports ?date= ?paymentMethod= ?status=)
router.get('/', getSales);

// GET /api/sales/:id      - get one sale with its line items
router.get('/:id', getSaleById);

// POST /api/sales         - record a new sale (transaction + stock deduction)
router.post('/', createSale);

// PUT /api/sales/:id      - update sale details (customer name, payment method, status)
router.put('/:id', updateSale);

// PATCH /api/sales/:id/cancel - cancel a sale (transaction + stock restoration)
router.patch('/:id/cancel', cancelSale);

// DELETE /api/sales/:id   - delete a sale (restores stock if completed, cascades items)
router.delete('/:id', deleteSale);

module.exports = router;

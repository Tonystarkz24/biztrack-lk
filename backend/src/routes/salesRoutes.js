const express = require('express');
const router = express.Router();
const { getSales, getSaleById, createSale, cancelSale } = require('../controllers/salesController');

// GET /api/sales          - list all sales (supports ?date= ?paymentMethod= ?status=)
router.get('/', getSales);

// GET /api/sales/:id      - get one sale with its line items
router.get('/:id', getSaleById);

// POST /api/sales         - record a new sale (transaction + stock deduction)
router.post('/', createSale);

// PATCH /api/sales/:id/cancel - cancel a sale (transaction + stock restoration)
router.patch('/:id/cancel', cancelSale);

module.exports = router;

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/products - List products with ?search=, ?category=, ?lowStock=
router.get('/', productController.getProducts);

// GET /api/products/:id - Get single product by id
router.get('/:id', productController.getProductById);

// POST /api/products - Create new product
router.post('/', productController.createProduct);

// PUT /api/products/:id - Update existing product
router.put('/:id', productController.updateProduct);

// PATCH /api/products/:id/status - Toggle/set active status
router.patch('/:id/status', productController.toggleProductStatus);

// DELETE /api/products/:id - Delete product (prevented if sales history exists)
router.delete('/:id', productController.deleteProduct);

module.exports = router;

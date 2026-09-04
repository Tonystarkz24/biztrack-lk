const pool = require('../config/database');

/**
 * Helper to validate product payload
 */
function validateProductData(data, isUpdate = false) {
  const errors = [];
  const {
    sku,
    name,
    category,
    unit,
    cost_price,
    selling_price,
    stock_quantity,
    reorder_level,
    is_active
  } = data;

  if (!isUpdate || sku !== undefined) {
    if (!sku || typeof sku !== 'string' || sku.trim().length === 0) {
      errors.push('SKU is required.');
    } else if (sku.trim().length > 30) {
      errors.push('SKU must not exceed 30 characters.');
    }
  }

  if (!isUpdate || name !== undefined) {
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('Name is required and must be at least 2 characters.');
    } else if (name.trim().length > 100) {
      errors.push('Name must not exceed 100 characters.');
    }
  }

  if (!isUpdate || category !== undefined) {
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      errors.push('Category is required.');
    } else if (category.trim().length > 50) {
      errors.push('Category must not exceed 50 characters.');
    }
  }

  if (!isUpdate || unit !== undefined) {
    if (!unit || typeof unit !== 'string' || unit.trim().length === 0) {
      errors.push('Unit is required.');
    } else if (unit.trim().length > 20) {
      errors.push('Unit must not exceed 20 characters.');
    }
  }

  if (!isUpdate || cost_price !== undefined) {
    const numCost = Number(cost_price);
    if (cost_price === undefined || cost_price === null || isNaN(numCost) || numCost < 0) {
      errors.push('Cost price must be a non-negative number.');
    }
  }

  if (!isUpdate || selling_price !== undefined) {
    const numSelling = Number(selling_price);
    if (selling_price === undefined || selling_price === null || isNaN(numSelling) || numSelling < 0) {
      errors.push('Selling price must be a non-negative number.');
    }
  }

  if (stock_quantity !== undefined && stock_quantity !== null && stock_quantity !== '') {
    const numStock = Number(stock_quantity);
    if (isNaN(numStock) || numStock < 0) {
      errors.push('Stock quantity cannot be negative.');
    }
  }

  if (reorder_level !== undefined && reorder_level !== null && reorder_level !== '') {
    const numReorder = Number(reorder_level);
    if (isNaN(numReorder) || numReorder < 0) {
      errors.push('Reorder level cannot be negative.');
    }
  }

  if (is_active !== undefined && typeof is_active !== 'boolean') {
    errors.push('is_active must be a boolean.');
  }

  return errors;
}

/**
 * GET /api/products
 * Query params: search, category, lowStock
 */
const getProducts = async (req, res, next) => {
  try {
    const { search, category, lowStock } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      query += ` AND (name ILIKE $${params.length} OR sku ILIKE $${params.length})`;
    }

    if (category && category.trim()) {
      params.push(category.trim());
      query += ` AND category = $${params.length}`;
    }

    if (lowStock === 'true' || lowStock === true) {
      query += ` AND stock_quantity <= reorder_level`;
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/products
 */
const createProduct = async (req, res, next) => {
  try {
    const validationErrors = validateProductData(req.body, false);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(' '),
        data: null
      });
    }

    const {
      sku,
      name,
      category,
      unit,
      cost_price,
      selling_price,
      stock_quantity = 0,
      reorder_level = 5,
      is_active = true
    } = req.body;

    // Check SKU uniqueness beforehand for a clean error message
    const skuCheck = await pool.query('SELECT id FROM products WHERE sku = $1', [sku.trim()]);
    if (skuCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A product with this SKU already exists.',
        data: null
      });
    }

    const insertQuery = `
      INSERT INTO products (
        sku, name, category, unit, cost_price, selling_price, stock_quantity, reorder_level, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      sku.trim(),
      name.trim(),
      category.trim(),
      unit.trim(),
      Number(cost_price),
      Number(selling_price),
      stock_quantity !== undefined && stock_quantity !== null ? Number(stock_quantity) : 0,
      reorder_level !== undefined && reorder_level !== null ? Number(reorder_level) : 5,
      is_active !== undefined ? Boolean(is_active) : true
    ];

    const result = await pool.query(insertQuery, values);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'A product with this SKU already exists.',
        data: null
      });
    }
    next(error);
  }
};

/**
 * PUT /api/products/:id
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existing = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null
      });
    }

    const validationErrors = validateProductData(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(' '),
        data: null
      });
    }

    const current = existing.rows[0];
    const sku = req.body.sku !== undefined ? req.body.sku.trim() : current.sku;
    const name = req.body.name !== undefined ? req.body.name.trim() : current.name;
    const category = req.body.category !== undefined ? req.body.category.trim() : current.category;
    const unit = req.body.unit !== undefined ? req.body.unit.trim() : current.unit;
    const cost_price = req.body.cost_price !== undefined ? Number(req.body.cost_price) : current.cost_price;
    const selling_price = req.body.selling_price !== undefined ? Number(req.body.selling_price) : current.selling_price;
    const stock_quantity = req.body.stock_quantity !== undefined ? Number(req.body.stock_quantity) : current.stock_quantity;
    const reorder_level = req.body.reorder_level !== undefined ? Number(req.body.reorder_level) : current.reorder_level;
    const is_active = req.body.is_active !== undefined ? Boolean(req.body.is_active) : current.is_active;

    // If SKU changed, verify uniqueness
    if (sku !== current.sku) {
      const skuCheck = await pool.query('SELECT id FROM products WHERE sku = $1 AND id != $2', [sku, id]);
      if (skuCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'A product with this SKU already exists.',
          data: null
        });
      }
    }

    const updateQuery = `
      UPDATE products
      SET
        sku = $1,
        name = $2,
        category = $3,
        unit = $4,
        cost_price = $5,
        selling_price = $6,
        stock_quantity = $7,
        reorder_level = $8,
        is_active = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `;

    const values = [
      sku,
      name,
      category,
      unit,
      cost_price,
      selling_price,
      stock_quantity,
      reorder_level,
      is_active,
      id
    ];

    const result = await pool.query(updateQuery, values);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'A product with this SKU already exists.',
        data: null
      });
    }
    next(error);
  }
};

/**
 * PATCH /api/products/:id/status
 */
const toggleProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const existing = await pool.query('SELECT id, is_active FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null
      });
    }

    const currentStatus = existing.rows[0].is_active;
    const newStatus = typeof is_active === 'boolean' ? is_active : !currentStatus;

    const result = await pool.query(
      'UPDATE products SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [newStatus, id]
    );

    return res.status(200).json({
      success: true,
      message: `Product ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/products/:id
 * Rule: A product with sales history cannot be deleted (returns 409)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT id, name FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null
      });
    }

    // Check if product is referenced in sale_items
    const salesCheck = await pool.query(
      'SELECT 1 FROM sale_items WHERE product_id = $1 LIMIT 1',
      [id]
    );

    if (salesCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete product because it has existing sales records. You may deactivate the product instead.',
        data: null
      });
    }

    await pool.query('DELETE FROM products WHERE id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: null
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete product because it is referenced in sales records. You may deactivate it instead.',
        data: null
      });
    }
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct
};

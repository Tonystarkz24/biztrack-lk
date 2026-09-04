const pool = require('../config/database');

// GET /api/sales
const getSales = async (req, res) => {
  try {
    const { date, paymentMethod, status } = req.query;
    let query = `
      SELECT
        s.id, s.customer_name, s.payment_method, s.status,
        s.total_amount, s.total_cost, s.created_at,
        COUNT(si.id)::int AS item_count
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE 1 = 1
    `;
    const params = [];
    let idx = 1;
    if (date)          { query += ` AND DATE(s.created_at) = $${idx++}`; params.push(date); }
    if (paymentMethod) { query += ` AND s.payment_method = $${idx++}`; params.push(paymentMethod); }
    if (status)        { query += ` AND s.status = $${idx++}`; params.push(status); }
    query += ` GROUP BY s.id ORDER BY s.created_at DESC`;
    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, message: 'Sales retrieved successfully', data: result.rows });
  } catch (err) {
    console.error('[getSales]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve sales' });
  }
};

// GET /api/sales/:id
const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const saleResult = await pool.query('SELECT * FROM sales WHERE id = $1', [id]);
    if (saleResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }
    const itemsResult = await pool.query(
      `SELECT si.id, si.product_id, si.quantity, si.unit_price, si.unit_cost, si.subtotal, p.name AS product_name
       FROM sale_items si JOIN products p ON si.product_id = p.id WHERE si.sale_id = $1`,
      [id]
    );
    return res.status(200).json({
      success: true, message: 'Sale retrieved successfully',
      data: { ...saleResult.rows[0], items: itemsResult.rows }
    });
  } catch (err) {
    console.error('[getSaleById]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve sale' });
  }
};

// POST /api/sales
const createSale = async (req, res) => {
  const { customerName, paymentMethod, items } = req.body;
  if (!paymentMethod || typeof paymentMethod !== 'string') {
    return res.status(400).json({ success: false, message: 'Payment method is required' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one item is required' });
  }
  for (const item of items) {
    if (!item.productId) {
      return res.status(400).json({ success: false, message: 'Each item must include a productId' });
    }
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: `Quantity must be a positive integer (productId ${item.productId})` });
    }
  }
  // Merge duplicate productIds safely
  const productMap = new Map();
  for (const item of items) {
    const pid = Number(item.productId);
    productMap.set(pid, (productMap.get(pid) || 0) + Number(item.quantity));
  }
  const deduped = Array.from(productMap.entries()).map(([productId, quantity]) => ({ productId, quantity }));

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let totalAmount = 0, totalCost = 0;
    const saleItems = [];
    for (const item of deduped) {
      const prodResult = await client.query(
        'SELECT id, name, selling_price, cost_price, stock_quantity, is_active FROM products WHERE id = $1 FOR UPDATE',
        [item.productId]
      );
      if (prodResult.rows.length === 0) throw { status: 404, message: `Product with ID ${item.productId} not found` };
      const p = prodResult.rows[0];
      if (!p.is_active) throw { status: 400, message: `Product "${p.name}" is not active` };
      if (p.stock_quantity < item.quantity) throw {
        status: 400,
        message: `Insufficient stock for "${p.name}". Available: ${p.stock_quantity}, Requested: ${item.quantity}`
      };
      const unitPrice = parseFloat(p.selling_price);
      const unitCost  = parseFloat(p.cost_price);
      const subtotal  = unitPrice * item.quantity;
      totalAmount += subtotal;
      totalCost   += unitCost * item.quantity;
      saleItems.push({ productId: item.productId, quantity: item.quantity, unitPrice, unitCost, subtotal });
    }
    const saleResult = await client.query(
      "INSERT INTO sales (customer_name, payment_method, total_amount, total_cost, status, created_at) VALUES ($1,$2,$3,$4,'completed',NOW()) RETURNING *",
      [customerName || null, paymentMethod, totalAmount, totalCost]
    );
    const sale = saleResult.rows[0];
    for (const item of saleItems) {
      await client.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, unit_cost, subtotal) VALUES ($1,$2,$3,$4,$5,$6)',
        [sale.id, item.productId, item.quantity, item.unitPrice, item.unitCost, item.subtotal]
      );
      await client.query('UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2', [item.quantity, item.productId]);
    }
    await client.query('COMMIT');
    return res.status(201).json({ success: true, message: 'Sale recorded successfully', data: { ...sale, items: saleItems } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[createSale]', err);
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    return res.status(500).json({ success: false, message: 'Failed to record sale. Please try again.' });
  } finally {
    client.release();
  }
};

// PATCH /api/sales/:id/cancel
const cancelSale = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const saleResult = await client.query('SELECT * FROM sales WHERE id = $1 FOR UPDATE', [id]);
    if (saleResult.rows.length === 0) throw { status: 404, message: 'Sale not found' };
    const sale = saleResult.rows[0];
    if (sale.status === 'cancelled') throw { status: 400, message: 'This sale has already been cancelled' };
    const itemsResult = await client.query('SELECT product_id, quantity FROM sale_items WHERE sale_id = $1', [id]);
    for (const item of itemsResult.rows) {
      await client.query('UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2', [item.quantity, item.product_id]);
    }
    const updatedResult = await client.query("UPDATE sales SET status = 'cancelled' WHERE id = $1 RETURNING *", [id]);
    await client.query('COMMIT');
    return res.status(200).json({ success: true, message: 'Sale cancelled successfully', data: updatedResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[cancelSale]', err);
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    return res.status(500).json({ success: false, message: 'Failed to cancel sale. Please try again.' });
  } finally {
    client.release();
  }
};

module.exports = { getSales, getSaleById, createSale, cancelSale };

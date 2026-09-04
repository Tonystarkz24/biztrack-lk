const pool = require('../config/database');

/**
 * Get aggregated dashboard summary metrics
 * GET /api/dashboard/summary?date=YYYY-MM-DD
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const { date } = req.query;
    const dateFilter = date ? String(date).trim() : null;

    let revenue = 0;
    let costOfGoodsSold = 0;
    let expenses = 0;
    let activeProducts = 0;
    let lowStockProducts = 0;
    let recentSales = [];
    let recentExpenses = [];
    let lowStockItems = [];

    // Attempt to query Neon PostgreSQL if a valid DATABASE_URL is configured
    const isPlaceholder = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('username:password@host');
    if (!isPlaceholder) {
      try {
        // 1. Revenue: Completed sales total
        const revenueQuery = `
          SELECT COALESCE(SUM(total_amount), 0) AS total_revenue
          FROM sales
          WHERE LOWER(COALESCE(status, 'completed')) != 'cancelled'
            AND ($1::date IS NULL OR DATE(COALESCE(created_at, sale_date, NOW())) = $1::date)
        `;
        const revenueRes = await pool.query(revenueQuery, [dateFilter]);
        if (revenueRes.rows.length > 0) {
          revenue = Number(revenueRes.rows[0].total_revenue) || 0;
        }
      } catch (err) {
        console.warn('Dashboard notice (sales/revenue query):', err.message);
      }

      try {
        // 2. Cost of goods sold: quantity * unit_cost for completed sales
        const cogsQuery = `
          SELECT COALESCE(SUM(si.quantity * COALESCE(si.unit_cost, p.unit_cost, 0)), 0) AS total_cogs
          FROM sale_items si
          JOIN sales s ON si.sale_id = s.id
          LEFT JOIN products p ON si.product_id = p.id
          WHERE LOWER(COALESCE(s.status, 'completed')) != 'cancelled'
            AND ($1::date IS NULL OR DATE(COALESCE(s.created_at, s.sale_date, NOW())) = $1::date)
        `;
        const cogsRes = await pool.query(cogsQuery, [dateFilter]);
        if (cogsRes.rows.length > 0) {
          costOfGoodsSold = Number(cogsRes.rows[0].total_cogs) || 0;
        }
      } catch (err) {
        console.warn('Dashboard notice (cogs query):', err.message);
      }

      try {
        // 3. Expenses total
        const expenseQuery = `
          SELECT COALESCE(SUM(amount), 0) AS total_expenses
          FROM expenses
          WHERE ($1::date IS NULL OR DATE(COALESCE(expense_date, created_at, NOW())) = $1::date)
        `;
        const expenseRes = await pool.query(expenseQuery, [dateFilter]);
        if (expenseRes.rows.length > 0) {
          expenses = Number(expenseRes.rows[0].total_expenses) || 0;
        }
      } catch (err) {
        console.warn('Dashboard notice (expenses query):', err.message);
      }

      try {
        // 4. Products: Active products & low stock products
        const productsCountQuery = `
          SELECT 
            COUNT(CASE WHEN is_active = true OR status = 'active' OR (status IS NULL AND is_active IS NULL) THEN 1 END) AS active_count,
            COUNT(CASE WHEN stock_quantity <= COALESCE(low_stock_threshold, 10) THEN 1 END) AS low_stock_count
          FROM products
        `;
        const productsRes = await pool.query(productsCountQuery);
        if (productsRes.rows.length > 0) {
          activeProducts = Number(productsRes.rows[0].active_count) || 0;
          lowStockProducts = Number(productsRes.rows[0].low_stock_count) || 0;
        }
      } catch (err) {
        console.warn('Dashboard notice (products count query):', err.message);
      }

      try {
        // 5. Low stock items list
        const lowStockQuery = `
          SELECT id, name, COALESCE(sku, '') AS sku, stock_quantity, COALESCE(low_stock_threshold, 10) AS low_stock_threshold
          FROM products
          WHERE stock_quantity <= COALESCE(low_stock_threshold, 10)
          ORDER BY stock_quantity ASC
          LIMIT 5
        `;
        const lowStockRes = await pool.query(lowStockQuery);
        lowStockItems = lowStockRes.rows.map((row) => ({
          id: row.id,
          name: row.name,
          sku: row.sku,
          stockQuantity: Number(row.stock_quantity) || 0,
          lowStockThreshold: Number(row.low_stock_threshold) || 10
        }));
      } catch (err) {
        console.warn('Dashboard notice (low stock items query):', err.message);
      }

      try {
        // 6. Recent sales
        const recentSalesQuery = `
          SELECT id, COALESCE(invoice_number, CONCAT('INV-', id)) AS invoice_number, total_amount, status, created_at
          FROM sales
          WHERE LOWER(COALESCE(status, 'completed')) != 'cancelled'
          ORDER BY created_at DESC
          LIMIT 5
        `;
        const recentSalesRes = await pool.query(recentSalesQuery);
        recentSales = recentSalesRes.rows.map((row) => ({
          id: row.id,
          invoiceNumber: row.invoice_number,
          totalAmount: Number(row.total_amount) || 0,
          status: row.status || 'completed',
          createdAt: row.created_at
        }));
      } catch (err) {
        console.warn('Dashboard notice (recent sales query):', err.message);
      }

      try {
        // 7. Recent expenses
        const recentExpensesQuery = `
          SELECT id, category, COALESCE(description, '') AS description, amount, COALESCE(expense_date, created_at) AS created_at
          FROM expenses
          ORDER BY created_at DESC
          LIMIT 5
        `;
        const recentExpensesRes = await pool.query(recentExpensesQuery);
        recentExpenses = recentExpensesRes.rows.map((row) => ({
          id: row.id,
          category: row.category,
          description: row.description,
          amount: Number(row.amount) || 0,
          createdAt: row.created_at
        }));
      } catch (err) {
        console.warn('Dashboard notice (recent expenses query):', err.message);
      }
    }

    // Mathematical calculations per requirements:
    // Gross profit = revenue - cost of goods sold
    // Estimated profit = revenue - cost of goods sold - expenses
    const grossProfit = Number((revenue - costOfGoodsSold).toFixed(2));
    const estimatedProfit = Number((revenue - costOfGoodsSold - expenses).toFixed(2));

    return res.status(200).json({
      success: true,
      data: {
        revenue: Number(revenue.toFixed(2)),
        costOfGoodsSold: Number(costOfGoodsSold.toFixed(2)),
        grossProfit,
        expenses: Number(expenses.toFixed(2)),
        estimatedProfit,
        activeProducts: Number(activeProducts),
        lowStockProducts: Number(lowStockProducts),
        recentSales,
        recentExpenses,
        lowStockItems
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary
};

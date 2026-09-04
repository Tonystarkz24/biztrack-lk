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
      // 1. Revenue query (completed sales)
      const revenuePromise = pool.query(
        `SELECT COALESCE(SUM(total_amount), 0) AS total_revenue
         FROM sales
         WHERE LOWER(COALESCE(status, 'completed')) != 'cancelled'
           AND ($1::date IS NULL OR DATE(COALESCE(sold_at, created_at, NOW())) = $1::date)`,
        [dateFilter]
      );

      // 2. Cost of goods sold query (quantity * unit_cost from sale_items or products cost_price)
      const cogsPromise = pool.query(
        `SELECT COALESCE(SUM(si.quantity * COALESCE(si.unit_cost, p.cost_price, 0)), 0) AS total_cogs
         FROM sale_items si
         JOIN sales s ON si.sale_id = s.id
         LEFT JOIN products p ON si.product_id = p.id
         WHERE LOWER(COALESCE(status, 'completed')) != 'cancelled'
           AND ($1::date IS NULL OR DATE(COALESCE(s.sold_at, s.created_at, NOW())) = $1::date)`,
        [dateFilter]
      );

      // 3. Expenses query
      const expensePromise = pool.query(
        `SELECT COALESCE(SUM(amount), 0) AS total_expenses
         FROM expenses
         WHERE ($1::date IS NULL OR DATE(COALESCE(expense_date, created_at, NOW())) = $1::date)`,
        [dateFilter]
      );

      // 4. Products counts query (active and low stock)
      const productsCountPromise = pool.query(
        `SELECT 
           COUNT(CASE WHEN is_active = true THEN 1 END) AS active_count,
           COUNT(CASE WHEN stock_quantity <= COALESCE(reorder_level, 5) THEN 1 END) AS low_stock_count
         FROM products`
      );

      // 5. Low stock items query
      const lowStockPromise = pool.query(
        `SELECT id, name, COALESCE(sku, '') AS sku, stock_quantity, COALESCE(reorder_level, 5) AS low_stock_threshold
         FROM products
         WHERE stock_quantity <= COALESCE(reorder_level, 5)
         ORDER BY stock_quantity ASC
         LIMIT 5`
      );

      // 6. Recent sales query
      const recentSalesPromise = pool.query(
        `SELECT id, CONCAT('INV-', id) AS invoice_number, total_amount, status, COALESCE(sold_at, created_at) AS created_at
         FROM sales
         WHERE LOWER(COALESCE(status, 'completed')) != 'cancelled'
         ORDER BY COALESCE(sold_at, created_at) DESC
         LIMIT 5`
      );

      // 7. Recent expenses query
      const recentExpensesPromise = pool.query(
        `SELECT id, category, COALESCE(note, title, '') AS description, amount, COALESCE(expense_date, created_at) AS created_at
         FROM expenses
         ORDER BY COALESCE(expense_date, created_at) DESC
         LIMIT 5`
      );

      // Execute all queries concurrently
      const [
        revenueResult,
        cogsResult,
        expenseResult,
        productsCountResult,
        lowStockResult,
        recentSalesResult,
        recentExpensesResult
      ] = await Promise.allSettled([
        revenuePromise,
        cogsPromise,
        expensePromise,
        productsCountPromise,
        lowStockPromise,
        recentSalesPromise,
        recentExpensesPromise
      ]);

      if (revenueResult.status === 'fulfilled' && revenueResult.value.rows.length > 0) {
        revenue = Number(revenueResult.value.rows[0].total_revenue) || 0;
      }
      if (cogsResult.status === 'fulfilled' && cogsResult.value.rows.length > 0) {
        costOfGoodsSold = Number(cogsResult.value.rows[0].total_cogs) || 0;
      }
      if (expenseResult.status === 'fulfilled' && expenseResult.value.rows.length > 0) {
        expenses = Number(expenseResult.value.rows[0].total_expenses) || 0;
      }
      if (productsCountResult.status === 'fulfilled' && productsCountResult.value.rows.length > 0) {
        activeProducts = Number(productsCountResult.value.rows[0].active_count) || 0;
        lowStockProducts = Number(productsCountResult.value.rows[0].low_stock_count) || 0;
      }
      if (lowStockResult.status === 'fulfilled') {
        lowStockItems = lowStockResult.value.rows.map((row) => ({
          id: row.id,
          name: row.name,
          sku: row.sku,
          stockQuantity: Number(row.stock_quantity) || 0,
          lowStockThreshold: Number(row.low_stock_threshold) || 5
        }));
      }
      if (recentSalesResult.status === 'fulfilled') {
        recentSales = recentSalesResult.value.rows.map((row) => ({
          id: row.id,
          invoiceNumber: row.invoice_number,
          totalAmount: Number(row.total_amount) || 0,
          status: row.status || 'completed',
          createdAt: row.created_at
        }));
      }
      if (recentExpensesResult.status === 'fulfilled') {
        recentExpenses = recentExpensesResult.value.rows.map((row) => ({
          id: row.id,
          category: row.category,
          description: row.description,
          amount: Number(row.amount) || 0,
          createdAt: row.created_at
        }));
      }
    }

    // Mathematical calculations per requirements
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

const pool = require('../config/database');

const ALLOWED_CATEGORIES = [
  'Electricity',
  'Water',
  'Rent',
  'Transport',
  'Packaging',
  'Maintenance',
  'Salary',
  'Other'
];

const validateExpense = (data) => {
  const errors = [];
  const { title, category, amount, expenseDate } = data;

  if (!title || typeof title !== 'string' || title.length < 2 || title.length > 100) {
    errors.push('Title is required and must be between 2 and 100 characters.');
  }

  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    errors.push(`Category is required and must be one of: ${ALLOWED_CATEGORIES.join(', ')}.`);
  }

  if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
    errors.push('Amount must be a number greater than zero.');
  }

  if (!expenseDate || isNaN(Date.parse(expenseDate))) {
    errors.push('A valid expense date is required.');
  }

  return errors;
};

exports.getAllExpenses = async (req, res) => {
  try {
    const { search, category, startDate, endDate } = req.query;
    let query = 'SELECT * FROM expenses WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND title ILIKE $${paramIndex}`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      query += ` AND category = $${paramIndex}`;
      values.push(category);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND expense_date >= $${paramIndex}`;
      values.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND expense_date <= $${paramIndex}`;
      values.push(endDate);
      paramIndex++;
    }

    query += ' ORDER BY expense_date DESC';

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      message: 'Expenses retrieved successfully',
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve expenses',
      error: error.message
    });
  }
};

exports.getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM expenses WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense retrieved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve expense',
      error: error.message
    });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { title, category, amount, expenseDate, note } = req.body;
    
    // Using expenseDate mapping to expense_date
    const payload = { title, category, amount, expenseDate, note };
    
    const errors = validateExpense(payload);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const query = `
      INSERT INTO expenses (title, category, amount, expense_date, note)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [title, category, amount, expenseDate, note || null];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create expense',
      error: error.message
    });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, amount, expenseDate, note } = req.body;

    const errors = validateExpense({ title, category, amount, expenseDate });
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const checkResult = await pool.query('SELECT * FROM expenses WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const query = `
      UPDATE expenses
      SET title = $1,
          category = $2,
          amount = $3,
          expense_date = $4,
          note = $5,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *;
    `;
    const values = [title, category, amount, expenseDate, note || null, id];

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update expense',
      error: error.message
    });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const checkResult = await pool.query('SELECT * FROM expenses WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    await pool.query('DELETE FROM expenses WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense',
      error: error.message
    });
  }
};

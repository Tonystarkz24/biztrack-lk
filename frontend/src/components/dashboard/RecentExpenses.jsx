import React from 'react';
import { formatLKR } from '../../services/dashboardService';

const RecentExpenses = ({ expenses = [] }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="card-panel">
        <h3 className="panel-title">Recent Expenses</h3>
        <div className="empty-state">
          <span className="empty-icon">💸</span>
          <p>No expenses recorded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-panel">
      <div className="panel-header">
        <h3 className="panel-title">Recent Expenses</h3>
        <span className="badge warning">{expenses.length} Records</span>
      </div>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id || `${expense.category}-${expense.amount}`}>
                <td>
                  <span className="badge category">{expense.category || 'General'}</span>
                </td>
                <td className="text-secondary">{expense.description || '—'}</td>
                <td className="text-danger font-semibold">{formatLKR(expense.amount)}</td>
                <td className="text-secondary">
                  {expense.createdAt ? new Date(expense.createdAt).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentExpenses;

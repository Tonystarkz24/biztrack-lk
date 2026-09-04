import React, { useMemo } from 'react';

const ExpenseSummary = ({ expenses = [] }) => {
  const total = useMemo(() => {
    return expenses.reduce((sum, expense) => {
      return sum + Number(expense.amount || 0);
    }, 0);
  }, [expenses]);

  return (
    <div className="stat-card" style={{ marginBottom: '1.5rem' }}>
      <div className="stat-header">
        <span>Total Expenses</span>
        <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
          💸
        </div>
      </div>
      <span className="stat-value" style={{ color: '#f87171' }}>
        LKR {total.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span className="stat-footer">{expenses.length} expense record{expenses.length !== 1 ? 's' : ''} found</span>
    </div>
  );
};

export default ExpenseSummary;

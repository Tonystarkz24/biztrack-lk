import React, { useMemo } from 'react';

const ExpenseSummary = ({ expenses = [] }) => {
  const total = useMemo(() => {
    return expenses.reduce((sum, expense) => {
      // Ensure we treat amount as a number (it might be returned as a string from postgres if it's decimal/numeric, but assuming it's casted correctly or we force it)
      return sum + Number(expense.amount || 0);
    }, 0);
  }, [expenses]);

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <h3 style={{ margin: 0, color: '#334155', fontSize: '18px', fontWeight: 600 }}>Total Expense</h3>
      <span style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#0f172a'
      }}>
        Rs. {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );
};

export default ExpenseSummary;

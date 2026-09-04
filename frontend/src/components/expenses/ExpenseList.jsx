import React from 'react';

const ExpenseList = ({ expenses, isLoading, onEdit, onDeleteClick }) => {
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
        Loading expenses...
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b', border: '1px dashed #cbd5e1' }}>
        No expenses found matching your criteria.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>Date</th>
            <th style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>Title</th>
            <th style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>Category</th>
            <th style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>Amount</th>
            <th style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>Note</th>
            <th style={{ padding: '12px 16px', fontWeight: 600, color: '#334155', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }}>
              <td style={{ padding: '12px 16px', color: '#475569' }}>
                {new Date(expense.expense_date).toLocaleDateString()}
              </td>
              <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0f172a' }}>{expense.title}</td>
              <td style={{ padding: '12px 16px' }}>
                <span style={{ 
                  backgroundColor: '#e0e7ff', color: '#3730a3', 
                  padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 
                }}>
                  {expense.category}
                </span>
              </td>
              <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                Rs. {Number(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '14px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {expense.note || '-'}
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                <button 
                  onClick={() => onEdit(expense)}
                  style={{ marginRight: '8px', padding: '6px 12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => onDeleteClick(expense)}
                  style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseList;

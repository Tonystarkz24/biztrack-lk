import React from 'react';

const ExpensesPage = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Operational Expenses</h1>
          <p className="page-subtitle">Record operational costs, electricity, rent, and overhead bills</p>
        </div>
      </div>

      <div className="card-panel">
        <div className="empty-state">
          <span className="empty-icon">💸</span>
          <h3>Expenses Module</h3>
          <p>Expense entries and category breakdown are being integrated by Member 3.</p>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;

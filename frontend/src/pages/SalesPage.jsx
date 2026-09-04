import React from 'react';

const SalesPage = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Sales Transactions</h1>
          <p className="page-subtitle">Record customer orders, billing invoices, and checkout transactions</p>
        </div>
      </div>

      <div className="card-panel">
        <div className="empty-state">
          <span className="empty-icon">🧾</span>
          <h3>Sales Module</h3>
          <p>Sales orders and checkout transactions are being integrated by Member 2.</p>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;

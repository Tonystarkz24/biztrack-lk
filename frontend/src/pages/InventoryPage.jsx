import React from 'react';

const InventoryPage = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">Track stock levels, product catalog, and procurement unit costs</p>
        </div>
      </div>

      <div className="card-panel">
        <div className="empty-state">
          <span className="empty-icon">📦</span>
          <h3>Inventory Module</h3>
          <p>Product catalog and inventory controls are being integrated by Member 1.</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;

import React from 'react';

const LowStockList = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return (
      <div className="card-panel">
        <h3 className="panel-title">Low Stock Alert</h3>
        <div className="empty-state">
          <span className="empty-icon">✅</span>
          <p>No low stock items. All inventory levels are healthy.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-panel">
      <div className="panel-header">
        <h3 className="panel-title">Low Stock Alert</h3>
        <span className="badge warning">{items.length} Items</span>
      </div>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Stock</th>
              <th>Threshold</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id || item.name}>
                <td className="font-medium">{item.name}</td>
                <td className="text-secondary">{item.sku || '—'}</td>
                <td className="text-danger font-semibold">{item.stockQuantity}</td>
                <td className="text-secondary">{item.lowStockThreshold}</td>
                <td>
                  <span className="badge danger">Low Stock</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LowStockList;

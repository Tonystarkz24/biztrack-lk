import React from 'react';
import { formatLKR } from '../../services/dashboardService';

const RecentSales = ({ sales = [] }) => {
  if (!sales || sales.length === 0) {
    return (
      <div className="card-panel">
        <h3 className="panel-title">Recent Sales</h3>
        <div className="empty-state">
          <span className="empty-icon">🧾</span>
          <p>No recent sales recorded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-panel">
      <div className="panel-header">
        <h3 className="panel-title">Recent Sales</h3>
        <span className="badge success">{sales.length} Transactions</span>
      </div>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id || sale.invoiceNumber}>
                <td className="font-medium">{sale.invoiceNumber || `INV-${sale.id}`}</td>
                <td className="text-success font-semibold">{formatLKR(sale.totalAmount)}</td>
                <td className="text-secondary">
                  {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : '—'}
                </td>
                <td>
                  <span className="badge success">{sale.status || 'Completed'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentSales;

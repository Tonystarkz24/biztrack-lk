import React from 'react';
import { formatLKR } from '../../services/dashboardService';

const RecentSales = ({ sales = [] }) => {
  if (!sales || sales.length === 0) {
    return (
      <div className="card-panel">
        <h3 className="panel-title">Recent Sales</h3>
        <div className="empty-state">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <p style={{ marginTop: '0.5rem' }}>No recent sales recorded yet.</p>
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

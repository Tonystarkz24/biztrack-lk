import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AgentQuickPanel = ({ title, endpoint, icon, studentRole, badgeText, onActionClick, actionLabel }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAgentInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(endpoint);
      setData(res.data);
    } catch (err) {
      console.error(`Failed to fetch from ${endpoint}:`, err);
      setError(err.response?.data?.message || 'Agent insights temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentInsights();
  }, [endpoint]);

  return (
    <div className="card agent-quick-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--color-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{title}</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{studentRole}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>{badgeText}</span>
          <button 
            className="btn btn-outline btn-sm" 
            onClick={fetchAgentInsights} 
            disabled={loading}
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
          >
            {loading ? 'Analyzing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading && <p className="text-muted" style={{ fontSize: '0.85rem' }}>Running agent analysis...</p>}
      
      {error && (
        <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', margin: 0 }}>
          {error}
        </p>
      )}

      {!loading && !error && data && (
        <div style={{ fontSize: '0.9rem' }}>
          {/* Inventory Auditor Data */}
          {data.agent === 'InventoryAuditorAgent' && (
            <div>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                Status: <strong style={{ color: data.totalDeficitItems > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>{data.status}</strong> 
                {' • '}{data.totalDeficitItems} item(s) below reorder threshold.
              </p>
              {data.items && data.items.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {data.items.map((item) => (
                    <span key={item.id} className="badge badge-danger" style={{ fontSize: '0.8rem' }}>
                      {item.name}: Stock {item.stockQuantity} (Deficit: {item.deficit})
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sales Demand Data */}
          {data.agent === 'SalesDemandAgent' && (
            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontStyle: 'italic', color: 'var(--text-primary)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
                Gemini Demand Insight: "{data.demandAnalysis}"
              </p>
              {data.topVelocityProducts && data.topVelocityProducts.length > 0 && (
                <small style={{ color: 'var(--text-secondary)' }}>
                  Top velocity products: {data.topVelocityProducts.map(p => `${p.productName} (${p.totalUnitsSold} units)`).join(', ')}
                </small>
              )}
            </div>
          )}

          {/* Procurement Cost Data */}
          {data.agent === 'ProcurementCostAgent' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span>
                  Estimated Replenishment Cost: <strong style={{ color: 'var(--color-primary)' }}>LKR {data.totalEstimatedCapitalCommitmentLkr?.toLocaleString()}</strong>
                  {' '}(across {data.deficitProductLines} depleted product lines)
                </span>
                <span className={`badge ${data.requiresAdminApproval ? 'badge-warning' : 'badge-success'}`}>
                  {data.requiresAdminApproval ? 'Exceeds LKR 15,000 (Requires Admin Sign-off)' : 'Within Autonomous Limit'}
                </span>
              </div>
            </div>
          )}

          {onActionClick && (
            <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
              <button className="btn btn-primary btn-sm" onClick={onActionClick}>
                {actionLabel || 'View Full Agent Trace'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentQuickPanel;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AgentQuickPanel = ({ title, endpoint, studentRole, badgeText, onActionClick, actionLabel }) => {
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

  // Determine avatar icon & theme based on title or endpoint
  const isInventory = endpoint.includes('inventory') || title.toLowerCase().includes('inventory');
  const isSales = endpoint.includes('sales') || title.toLowerCase().includes('sales');
  const isProcurement = endpoint.includes('procurement') || title.toLowerCase().includes('procurement');

  const avatarClass = isInventory ? 'inventory' : isSales ? 'sales' : 'procurement';

  const avatarIcon = isInventory ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ) : isSales ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );

  return (
    <div className="agent-quick-card">
      <div className="agent-header-row">
        <div className="agent-identity">
          <div className={`agent-avatar ${avatarClass}`}>
            {avatarIcon}
          </div>
          <div className="agent-title-block">
            <h3>{title}</h3>
            <span className="agent-student-tag">{studentRole}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="agent-badge-pill">
            <span className="status-dot-pulse"></span>
            <span>{badgeText}</span>
          </div>

          <button 
            type="button"
            className="btn btn-outline btn-sm" 
            onClick={fetchAgentInsights} 
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
          >
            <svg 
              width="13" 
              height="13" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {loading ? 'Analyzing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#ffffff', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <div className="spinner" style={{ width: '20px', height: '20px', margin: 0, borderWidth: '2px' }}></div>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Querying agent intelligence...</span>
        </div>
      )}
      
      {error && (
        <div style={{ padding: '0.85rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.875rem' }}>
          <strong>Notice:</strong> {error}
        </div>
      )}

      {!loading && !error && data && (
        <div className="agent-content-box">
          {/* Inventory Auditor Data */}
          {data.agent === 'InventoryAuditorAgent' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`badge ${data.totalDeficitItems > 0 ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.825rem', padding: '0.35rem 0.75rem' }}>
                    {data.status}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {data.totalDeficitItems === 0 
                      ? 'All active catalog items are maintained safely above threshold.' 
                      : `${data.totalDeficitItems} product line(s) below reorder threshold.`}
                  </span>
                </div>
              </div>

              {data.items && data.items.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  {data.items.map((item) => (
                    <span key={item.id} className="badge badge-danger" style={{ fontSize: '0.8rem', padding: '0.35rem 0.7rem' }}>
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
              <div className="agent-insight-quote">
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#7c3aed', marginBottom: '0.25rem' }}>
                  Gemini Demand Intelligence:
                </span>
                "{data.demandAnalysis}"
              </div>
              {data.topVelocityProducts && data.topVelocityProducts.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.825rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Top Velocity:</span>
                  {data.topVelocityProducts.map((p, idx) => (
                    <span key={idx} className="badge badge-info" style={{ fontSize: '0.775rem' }}>
                      {p.productName} ({p.totalUnitsSold} units sold)
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Procurement Cost Data */}
          {data.agent === 'ProcurementCostAgent' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                    Estimated Replenishment Commitment
                  </span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    LKR {data.totalEstimatedCapitalCommitmentLkr?.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </span>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                    (across {data.deficitProductLines} depleted product lines)
                  </span>
                </div>

                <div>
                  <span className={`badge ${data.requiresAdminApproval ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.825rem', padding: '0.4rem 0.85rem' }}>
                    {data.requiresAdminApproval ? 'Exceeds LKR 15,000 (Requires Admin Sign-off)' : 'Within LKR 15,000 Autonomous Limit'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(226, 232, 240, 0.7)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            {onActionClick ? (
              <button className="btn btn-primary btn-sm" onClick={onActionClick}>
                {actionLabel || 'View Full Agent Trace'}
              </button>
            ) : (
              <Link to="/agent-workflows" style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>
                View Multi-Agent Workflow Pipeline Trace →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentQuickPanel;

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardSummary, formatLKR } from '../services/dashboardService';
import SummaryCard from '../components/dashboard/SummaryCard';
import LowStockList from '../components/dashboard/LowStockList';
import RecentSales from '../components/dashboard/RecentSales';
import RecentExpenses from '../components/dashboard/RecentExpenses';

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  const fetchSummary = useCallback(async (dateFilter) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboardSummary(dateFilter || undefined);
      if (res && res.success && res.data) {
        setSummary(res.data);
      } else {
        throw new Error(res?.message || 'Failed to retrieve dashboard metrics');
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
      setError(err.response?.data?.message || err.message || 'Error connecting to dashboard server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary(selectedDate);
  }, [fetchSummary, selectedDate]);

  const handleRefresh = () => {
    fetchSummary(selectedDate);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleClearDate = () => {
    setSelectedDate('');
  };

  return (
    <div className="dashboard-container">
      {/* Dashboard Top Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Real-time overview of business performance, inventory health, and profits</p>
        </div>

        <div className="dashboard-actions">
          <div className="date-filter-group">
            <input
              type="date"
              className="date-input"
              value={selectedDate}
              onChange={handleDateChange}
              title="Filter metrics by date"
            />
            {selectedDate && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleClearDate}
                title="Clear date filter"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleRefresh}
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Quick Action & Health Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '0.85rem 1.25rem', background: '#ffffff', border: '1px solid rgba(226, 232, 240, 0.9)', borderRadius: '14px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className="status-dot-pulse"></span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            PostgreSQL Cloud Database Synchronized • Live LKR Ledger
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/sales" className="btn btn-outline btn-sm">
            + New Sale
          </Link>
          <Link to="/inventory" className="btn btn-outline btn-sm">
            + Add Product
          </Link>
          <Link to="/agent-workflows" className="btn btn-outline btn-sm" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
            AI Agent Trace →
          </Link>
        </div>
      </div>

      {/* Error Alert State */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <div className="alert-content">
            <strong>Unable to load dashboard data:</strong> {error}
          </div>
          <button type="button" className="btn btn-sm btn-outline" onClick={handleRefresh}>
            Retry
          </button>
        </div>
      )}

      {/* Loading State Skeleton / Spinner */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading real-time financial metrics and inventory data...</p>
        </div>
      )}

      {/* Dashboard Content */}
      {!loading && summary && (
        <>
          {/* Financial Overview Cards */}
          <div className="metrics-grid">
            <SummaryCard
              title="Total Revenue"
              value={formatLKR(summary.revenue)}
              subtitle="Completed sales volume"
              variant="revenue"
            />
            <SummaryCard
              title="Cost of Goods Sold"
              value={formatLKR(summary.costOfGoodsSold)}
              subtitle="Direct inventory procurement costs"
              variant="cogs"
            />
            <SummaryCard
              title="Gross Profit"
              value={formatLKR(summary.grossProfit)}
              subtitle="Revenue minus COGS"
              variant="gross-profit"
            />
            <SummaryCard
              title="Operating Expenses"
              value={formatLKR(summary.expenses)}
              subtitle="Utilities, rent & operational costs"
              variant="expense"
            />
            <SummaryCard
              title="Estimated Net Profit"
              value={formatLKR(summary.estimatedProfit)}
              subtitle="Gross profit minus expenses"
              variant={summary.estimatedProfit >= 0 ? 'profit' : 'danger'}
            />
            <SummaryCard
              title="Active Catalog"
              value={summary.activeProducts}
              subtitle="Active products in inventory"
              variant="info"
            />
            <SummaryCard
              title="Low Stock Warning"
              value={summary.lowStockProducts}
              subtitle="Items below reorder threshold"
              variant={summary.lowStockProducts > 0 ? 'warning' : 'neutral'}
            />
          </div>

          {/* Detailed Lists Grid */}
          <div className="details-grid">
            <LowStockList items={summary.lowStockItems} />
            <RecentSales sales={summary.recentSales} />
            <RecentExpenses expenses={summary.recentExpenses} />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;

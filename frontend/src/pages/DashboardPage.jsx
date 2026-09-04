import React, { useState, useEffect, useCallback } from 'react';
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
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
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
              icon="💰"
            />
            <SummaryCard
              title="Cost of Goods Sold"
              value={formatLKR(summary.costOfGoodsSold)}
              subtitle="Direct inventory procurement costs"
              variant="cogs"
              icon="📦"
            />
            <SummaryCard
              title="Gross Profit"
              value={formatLKR(summary.grossProfit)}
              subtitle="Revenue minus COGS"
              variant="gross-profit"
              icon="📈"
            />
            <SummaryCard
              title="Operating Expenses"
              value={formatLKR(summary.expenses)}
              subtitle="Utilities, rent & operational costs"
              variant="expense"
              icon="💳"
            />
            <SummaryCard
              title="Estimated Net Profit"
              value={formatLKR(summary.estimatedProfit)}
              subtitle="Gross profit minus expenses"
              variant={summary.estimatedProfit >= 0 ? 'profit' : 'danger'}
              icon={summary.estimatedProfit >= 0 ? '🏆' : '⚠️'}
            />
            <SummaryCard
              title="Active Catalog"
              value={summary.activeProducts}
              subtitle="Active products in inventory"
              variant="info"
              icon="🏷️"
            />
            <SummaryCard
              title="Low Stock Warning"
              value={summary.lowStockProducts}
              subtitle="Items below reorder threshold"
              variant={summary.lowStockProducts > 0 ? 'warning' : 'neutral'}
              icon="🔔"
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

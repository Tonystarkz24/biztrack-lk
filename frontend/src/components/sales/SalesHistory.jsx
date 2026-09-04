// SalesHistory – filterable list of past sales
function SalesHistory({ sales, loading, filters, onFilterChange, onViewSale }) {
  const change = (key, val) => onFilterChange({ ...filters, [key]: val });
  const hasFilters = filters.date || filters.paymentMethod || filters.status;

  const statusColor = { completed: "#10b981", cancelled: "#ef4444", pending: "#f59e0b" };

  return (
    <div className="sales-history">
      <div className="sales-history__header">
        <h2 className="panel-title">Sales History</h2>
        {hasFilters && (
          <button
            id="clear-filters-btn"
            className="clear-filters-btn"
            onClick={() => onFilterChange({ date: "", paymentMethod: "", status: "" })}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="filters-row">
        <input
          id="filter-date"
          type="date"
          className="form-input form-input--sm"
          value={filters.date}
          onChange={e => change("date", e.target.value)}
        />
        <select
          id="filter-payment-method"
          className="form-input form-input--sm form-input--select"
          value={filters.paymentMethod}
          onChange={e => change("paymentMethod", e.target.value)}
        >
          <option value="">All Methods</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="transfer">Transfer</option>
        </select>
        <select
          id="filter-status"
          className="form-input form-input--sm form-input--select"
          value={filters.status}
          onChange={e => change("status", e.target.value)}
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading sales&hellip;</p>
        </div>
      ) : sales.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">&#128203;</span>
          <p>No sales found</p>
          {hasFilters && <p className="empty-state__hint">Try clearing your filters</p>}
        </div>
      ) : (
        <div className="sales-list">
          {sales.map(sale => (
            <button
              key={sale.id}
              id={`sale-card-${sale.id}`}
              className="sale-card"
              onClick={() => onViewSale(sale.id)}
            >
              <div className="sale-card__header">
                <div>
                  <span className="sale-card__id">#{sale.id}</span>
                  {sale.customer_name && (
                    <span className="sale-card__customer">{sale.customer_name}</span>
                  )}
                </div>
                <span
                  className="sale-card__status"
                  style={{ color: statusColor[sale.status] || "#94a3b8" }}
                >
                  {sale.status}
                </span>
              </div>
              <div className="sale-card__footer">
                <div className="sale-card__meta">
                  <span className="sale-card__method">{sale.payment_method}</span>
                  <span className="sale-card__date">
                    {new Date(sale.created_at).toLocaleString()}
                  </span>
                </div>
                <span className="sale-card__total">
                  LKR {parseFloat(sale.total_amount).toFixed(2)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SalesHistory;

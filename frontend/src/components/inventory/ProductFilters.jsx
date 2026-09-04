import React from 'react';

/**
 * ProductFilters component
 * Provides real-time search, category dropdown filtering, low-stock filter toggle, and reset.
 */
function ProductFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  lowStock,
  onLowStockChange,
  categories = [],
  onReset
}) {
  const isFiltered = Boolean(search || category || lowStock);

  return (
    <div className="filters-container">
      {/* Search Input */}
      <div className="search-wrapper">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search by product name or SKU..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <button
            type="button"
            className="search-clear"
            onClick={() => onSearchChange('')}
            title="Clear search"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Category Dropdown */}
      <select
        className="filter-select"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        aria-label="Filter by Category"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Low-Stock Toggle */}
      <button
        type="button"
        className={`toggle-filter-btn ${lowStock ? 'active' : ''}`}
        onClick={() => onLowStockChange(!lowStock)}
        title="Show products with stock at or below reorder level"
      >
        <span>⚠️ Low Stock Only</span>
        {lowStock && <span>✓</span>}
      </button>

      {/* Reset Button */}
      {isFiltered && (
        <button
          type="button"
          className="btn-reset"
          onClick={onReset}
          title="Reset all filters"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}

export default ProductFilters;

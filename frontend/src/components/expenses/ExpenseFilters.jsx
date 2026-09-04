import React from 'react';

const CATEGORIES = [
  'Electricity', 'Water', 'Rent', 'Transport', 
  'Packaging', 'Maintenance', 'Salary', 'Other'
];

const ExpenseFilters = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="filters-container">
      <div className="search-wrapper">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input 
          className="search-input"
          type="text" 
          id="expense-search"
          name="search"
          placeholder="Search by title..." 
          value={filters.search} 
          onChange={handleChange}
        />
        {filters.search && (
          <button
            type="button"
            className="search-clear"
            onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
            title="Clear search"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <select 
        className="filter-select"
        id="expense-category"
        name="category"
        value={filters.category} 
        onChange={handleChange}
        aria-label="Filter by Category"
      >
        <option value="">All Categories</option>
        {CATEGORIES.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <input 
        className="form-input"
        type="date" 
        id="expense-startDate"
        name="startDate"
        value={filters.startDate} 
        onChange={handleChange}
        title="Start date"
      />

      <input 
        className="form-input"
        type="date" 
        id="expense-endDate"
        name="endDate"
        value={filters.endDate} 
        onChange={handleChange}
        title="End date"
      />
    </div>
  );
};

export default ExpenseFilters;

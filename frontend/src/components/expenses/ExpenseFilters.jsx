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

  const containerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '24px',
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 200px',
    gap: '6px'
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#475569'
  };

  const inputStyle = {
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={containerStyle}>
      <div style={inputGroupStyle}>
        <label style={labelStyle} htmlFor="search">Search by Title</label>
        <input 
          style={inputStyle}
          type="text" 
          id="search"
          name="search"
          placeholder="e.g. Delivery" 
          value={filters.search} 
          onChange={handleChange}
        />
      </div>

      <div style={inputGroupStyle}>
        <label style={labelStyle} htmlFor="category">Category</label>
        <select 
          style={inputStyle}
          id="category"
          name="category"
          value={filters.category} 
          onChange={handleChange}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div style={inputGroupStyle}>
        <label style={labelStyle} htmlFor="startDate">Start Date</label>
        <input 
          style={inputStyle}
          type="date" 
          id="startDate"
          name="startDate"
          value={filters.startDate} 
          onChange={handleChange}
        />
      </div>

      <div style={inputGroupStyle}>
        <label style={labelStyle} htmlFor="endDate">End Date</label>
        <input 
          style={inputStyle}
          type="date" 
          id="endDate"
          name="endDate"
          value={filters.endDate} 
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default ExpenseFilters;

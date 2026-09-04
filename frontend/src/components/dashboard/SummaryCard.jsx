import React from 'react';

const SummaryCard = ({ title, value, subtitle, variant = 'neutral', icon }) => {
  return (
    <div className={`metric-card ${variant}`}>
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        {icon && <span className="metric-icon">{icon}</span>}
      </div>
      <div className="metric-value">{value}</div>
      {subtitle && <div className="metric-subtitle">{subtitle}</div>}
    </div>
  );
};

export default SummaryCard;

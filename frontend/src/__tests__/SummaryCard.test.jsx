import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SummaryCard from '../components/dashboard/SummaryCard';
import { formatLKR } from '../services/dashboardService';

describe('SummaryCard Component', () => {
  it('renders title, formatted value, subtitle and icon correctly', () => {
    const title = 'Total Revenue';
    const value = formatLKR(125000.50);
    const subtitle = 'Completed sales volume';
    const icon = '💰';

    render(
      <SummaryCard
        title={title}
        value={value}
        subtitle={subtitle}
        variant="revenue"
        icon={icon}
      />
    );

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(/LKR 125,000.50/)).toBeInTheDocument();
    expect(screen.getByText(subtitle)).toBeInTheDocument();
    expect(screen.getByText(icon)).toBeInTheDocument();
  });
});

describe('Dashboard Service Helper', () => {
  it('correctly formats numbers to Sri Lankan Rupees (LKR)', () => {
    expect(formatLKR(0)).toBe('LKR 0.00');
    expect(formatLKR(1500)).toBe('LKR 1,500.00');
    expect(formatLKR(45890.75)).toBe('LKR 45,890.75');
    expect(formatLKR(null)).toBe('LKR 0.00');
  });
});

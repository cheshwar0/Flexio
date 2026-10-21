import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Header } from '../components/common/Header.js';

describe('Header Component', () => {
  it('renders official Flexio company logo, REDGEINE TECHNOLOGY subtitle, and leaderboard title', () => {
    render(<Header />);

    const logo = screen.getByAltText('FLEXIO');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('src')).toBe('/flexio-logo.png');
    expect(screen.getByText('WEEKLY TOP 10 PERFORMERS')).toBeDefined();
    expect(screen.getByText('REDGEINE TECHNOLOGY')).toBeDefined();
    expect(screen.queryByText('Alpha Team')).toBeNull();
  });

  it('renders custom company logo, custom subtitle, and date range when provided', () => {
    render(
      <Header
        companyName="Custom Corp"
        companyLogoUrl="https://example.com/logo.png"
        companySubtitle="CUSTOM SYSTEMS"
        weekTitle="Quarterly Honors"
        weekStartDate="2026-10-12T00:00:00.000Z"
        weekEndDate="2026-10-18T23:59:59.000Z"
      />
    );

    const logo = screen.getByAltText('Custom Corp');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('src')).toBe('https://example.com/logo.png');
    expect(screen.getByText('Quarterly Honors')).toBeDefined();
    expect(screen.getByText('CUSTOM SYSTEMS')).toBeDefined();
  });
});

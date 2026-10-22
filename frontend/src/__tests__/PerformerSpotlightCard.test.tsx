import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PerformerSpotlightCard } from '../components/common/PerformerSpotlightCard.js';
import { Performer } from '../types/index.js';

describe('PerformerSpotlightCard Component', () => {
  const mockRank1: Performer = {
    rank: 1,
    employeeId: 'EMP-1001',
    fullName: 'Sophia Montgomery',
    team: 'Sales & Revenue',
    designation: 'Senior Enterprise Account Executive',
    department: 'Sales & Revenue',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
    performanceScore: 994,
    achievementDescription: 'Closed $2.4M enterprise deal and exceeded quarterly target by 142%',
  };

  const mockRank2: Performer = {
    rank: 2,
    employeeId: 'EMP-1002',
    fullName: 'Marcus Vance',
    team: 'Engineering',
    designation: 'Staff Cloud Infrastructure Architect',
    department: 'Engineering',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    performanceScore: 981,
    achievementDescription: 'Delivered multi-region zero-downtime architecture',
  };

  it('renders performer in full spotlight with clean portrait, team badge, and thought box', () => {
    render(<PerformerSpotlightCard performer={mockRank1} totalPerformers={10} intervalMs={5000} />);

    // Name, role, and team (no employeeId)
    expect(screen.getByText('Sophia Montgomery')).toBeDefined();
    expect(screen.getByText('Senior Enterprise Account Executive')).toBeDefined();
    expect(screen.getByText(/TEAM: Sales & Revenue/i)).toBeDefined();
    expect(screen.queryByText('EMP-1001')).toBeNull();

    // Slogan Box
    expect(screen.getByText(/TEAM SLOGAN/i)).toBeDefined();
    expect(screen.getByText(/Closed \$2.4M enterprise deal/i)).toBeDefined();

    // Assert badges and score are removed
    expect(screen.queryByText('TOP PERFORMER')).toBeNull();
    expect(screen.queryByText('TOP 10 HONOREE')).toBeNull();
    expect(screen.queryByText(/RANK #1 • WEEKLY CHAMPION/i)).toBeNull();
    expect(screen.queryByText('Weekly Performance Score')).toBeNull();
    expect(screen.queryByText('/ 1,000 PTS')).toBeNull();
  });

  it('renders performer with their custom thought', () => {
    render(<PerformerSpotlightCard performer={mockRank2} totalPerformers={10} intervalMs={5000} />);

    expect(screen.getByText('Marcus Vance')).toBeDefined();
    expect(screen.getByText('Staff Cloud Infrastructure Architect')).toBeDefined();
    expect(screen.getByText(/TEAM: Engineering/i)).toBeDefined();
    expect(screen.getByText(/Delivered multi-region zero-downtime architecture/i)).toBeDefined();
    expect(screen.queryByText('RUNNER UP')).toBeNull();
    expect(screen.queryByText(/RANK #2/i)).toBeNull();
  });
});

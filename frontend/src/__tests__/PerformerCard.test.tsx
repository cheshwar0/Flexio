import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PerformerCard } from '../components/common/PerformerCard.js';
import { Performer } from '../types/index.js';

describe('PerformerCard Component', () => {
  const mockRank1: Performer = {
    rank: 1,
    employeeId: 'EMP-1001',
    fullName: 'Sophia Montgomery',
    team: 'Sales & Revenue',
    designation: 'Senior Enterprise Account Executive',
    department: 'Sales & Revenue',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
    performanceScore: 994,
    achievementDescription: 'Closed $2.4M enterprise deal',
  };

  const mockRank2: Performer = {
    rank: 2,
    employeeId: 'EMP-1002',
    fullName: 'Marcus Vance',
    team: 'Engineering',
    designation: 'Staff Cloud Architect',
    department: 'Engineering',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    performanceScore: 981,
  };

  it('renders Rank 1 champion badge, score, and employee details', () => {
    render(<PerformerCard performer={mockRank1} />);

    expect(screen.getByText(/RANK #1 • CHAMPION/i)).toBeDefined();
    expect(screen.getByText('Sophia Montgomery')).toBeDefined();
    expect(screen.getByText('Senior Enterprise Account Executive')).toBeDefined();
    expect(screen.getByText('Sales & Revenue')).toBeDefined();
    expect(screen.getByText('994')).toBeDefined();
    expect(screen.getByText('Closed $2.4M enterprise deal')).toBeDefined();
  });

  it('renders Rank 2 badge and score', () => {
    render(<PerformerCard performer={mockRank2} />);

    expect(screen.getByText(/RANK #2/i)).toBeDefined();
    expect(screen.getByText('Marcus Vance')).toBeDefined();
    expect(screen.getByText('Staff Cloud Architect')).toBeDefined();
    expect(screen.getByText('981')).toBeDefined();
  });
});

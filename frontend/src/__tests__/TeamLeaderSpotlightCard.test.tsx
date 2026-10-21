import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamLeaderSpotlightCard } from '../components/display/TeamLeaderSpotlightCard.js';
import { TopTeamLeaderRecognition } from '../types/index.js';

describe('TeamLeaderSpotlightCard Component', () => {
  it('renders single winning team leader with photo, full name, team name, and Top 10 count', () => {
    const mockRecognition: TopTeamLeaderRecognition = {
      published: true,
      isTie: false,
      maxEmployeeCount: 4,
      teamId: 'TEAM-01',
      teamName: 'Alpha',
      employeeCount: 4,
      weekStartDate: '2026-10-12T00:00:00.000Z',
      weekEndDate: '2026-10-18T23:59:59.000Z',
      teamLeader: {
        employeeId: 'EMP-1001',
        fullName: 'Sophia Montgomery',
        designation: 'Senior Enterprise Account Executive',
        imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
      },
      winningTeams: [
        {
          teamId: 'TEAM-01',
          teamName: 'Alpha',
          employeeCount: 4,
          teamLeader: {
            employeeId: 'EMP-1001',
            fullName: 'Sophia Montgomery',
            designation: 'Senior Enterprise Account Executive',
            imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
          },
        },
      ],
    };

    render(<TeamLeaderSpotlightCard recognition={mockRecognition} intervalMs={5000} />);

    expect(screen.getByText(/TOP PERFORMING TEAM LEADER OF THE WEEK/i)).toBeDefined();
    expect(screen.getByText('Sophia Montgomery')).toBeDefined();
    expect(screen.getByText('Senior Enterprise Account Executive')).toBeDefined();
    expect(screen.getByText(/WINNING TEAM: Alpha/i)).toBeDefined();
    expect(screen.getByText('4')).toBeDefined();
    expect(screen.getByText(/in this week's Top 10 leaderboard/i)).toBeDefined();
  });

  it('renders tied teams display when multiple teams tie for first place', () => {
    const mockRecognition: TopTeamLeaderRecognition = {
      published: true,
      isTie: true,
      maxEmployeeCount: 3,
      weekStartDate: '2026-10-12T00:00:00.000Z',
      weekEndDate: '2026-10-18T23:59:59.000Z',
      winningTeams: [
        {
          teamId: 'TEAM-01',
          teamName: 'Alpha',
          employeeCount: 3,
          teamLeader: {
            employeeId: 'EMP-1001',
            fullName: 'Sophia Montgomery',
            designation: 'Alpha Lead',
            imageUrl: 'https://images.unsplash.com/photo-1',
          },
        },
        {
          teamId: 'TEAM-02',
          teamName: 'Beta',
          employeeCount: 3,
          teamLeader: {
            employeeId: 'EMP-1002',
            fullName: 'Marcus Vance',
            designation: 'Beta Lead',
            imageUrl: 'https://images.unsplash.com/photo-2',
          },
        },
      ],
    };

    render(<TeamLeaderSpotlightCard recognition={mockRecognition} intervalMs={5000} />);

    expect(screen.getByText(/TOP PERFORMING TEAMS OF THE WEEK/i)).toBeDefined();
    expect(screen.getByText(/Tied with 3 Top 10 Employees Each/i)).toBeDefined();
    expect(screen.getByText('Sophia Montgomery')).toBeDefined();
    expect(screen.getByText('Marcus Vance')).toBeDefined();
  });

  it('displays professional fallback notice when winning team has no configured leader', () => {
    const mockRecognition: TopTeamLeaderRecognition = {
      published: true,
      isTie: false,
      maxEmployeeCount: 3,
      teamId: 'TEAM-04',
      teamName: 'Delta',
      employeeCount: 3,
      weekStartDate: '2026-10-12T00:00:00.000Z',
      weekEndDate: '2026-10-18T23:59:59.000Z',
      teamLeader: null,
      winningTeams: [
        {
          teamId: 'TEAM-04',
          teamName: 'Delta',
          employeeCount: 3,
          teamLeader: null,
        },
      ],
    };

    render(<TeamLeaderSpotlightCard recognition={mockRecognition} intervalMs={5000} />);

    expect(screen.getByText(/No team leader currently assigned/i)).toBeDefined();
    expect(screen.getByText(/Please configure a team leader in the HR Admin Panel/i)).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
  });
});


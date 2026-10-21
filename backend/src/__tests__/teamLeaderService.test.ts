import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateTopTeamLeaderFromPublished } from '../services/teamLeaderService.js';
import { WeeklyPerformance } from '../models/WeeklyPerformance.js';
import { WeeklyRanking } from '../models/WeeklyRanking.js';
import { Employee } from '../models/Employee.js';
import { Team } from '../models/Team.js';

describe('teamLeaderService — Top Team Leader Calculation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('determines winning team when one team has the strictly highest employee count', async () => {
    const mockWeek = {
      weekId: '2026-W42',
      title: 'Week 42 Drive',
      weekStartDate: new Date('2026-10-12'),
      weekEndDate: new Date('2026-10-18'),
      status: 'published',
      isCurrent: true,
      publishedAt: new Date(),
    };

    // Rankings: Team Alpha has 4, Team Beta has 3, Team Gamma has 2, Team Delta has 1
    const mockRankings = [
      { employeeId: 'EMP-A1', rank: 1, performanceScore: 990 },
      { employeeId: 'EMP-A2', rank: 2, performanceScore: 980 },
      { employeeId: 'EMP-A3', rank: 3, performanceScore: 970 },
      { employeeId: 'EMP-A4', rank: 4, performanceScore: 960 },
      { employeeId: 'EMP-B1', rank: 5, performanceScore: 950 },
      { employeeId: 'EMP-B2', rank: 6, performanceScore: 940 },
      { employeeId: 'EMP-B3', rank: 7, performanceScore: 930 },
      { employeeId: 'EMP-C1', rank: 8, performanceScore: 920 },
      { employeeId: 'EMP-C2', rank: 9, performanceScore: 910 },
      { employeeId: 'EMP-D1', rank: 10, performanceScore: 900 },
    ];

    const mockEmployees = [
      { employeeId: 'EMP-A1', fullName: 'Alice A1', team: 'Alpha', designation: 'Developer' },
      { employeeId: 'EMP-A2', fullName: 'Alice A2', team: 'Alpha', designation: 'Developer' },
      { employeeId: 'EMP-A3', fullName: 'Alice A3', team: 'Alpha', designation: 'Developer' },
      { employeeId: 'EMP-A4', fullName: 'Alice A4', team: 'Alpha', designation: 'Developer' },
      { employeeId: 'EMP-B1', fullName: 'Bob B1', team: 'Beta', designation: 'Architect' },
      { employeeId: 'EMP-B2', fullName: 'Bob B2', team: 'Beta', designation: 'Architect' },
      { employeeId: 'EMP-B3', fullName: 'Bob B3', team: 'Beta', designation: 'Architect' },
      { employeeId: 'EMP-C1', fullName: 'Carol C1', team: 'Gamma', designation: 'Designer' },
      { employeeId: 'EMP-C2', fullName: 'Carol C2', team: 'Gamma', designation: 'Designer' },
      { employeeId: 'EMP-D1', fullName: 'Dave D1', team: 'Delta', designation: 'Manager' },
      // Leader for Alpha
      {
        employeeId: 'LEAD-ALPHA',
        fullName: 'Sophia Leader',
        team: 'Alpha',
        designation: 'Alpha Team Lead',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sophia.jpg',
      },
    ];

    const mockTeams = [
      {
        teamId: 'TEAM-01',
        slotNumber: 1,
        name: 'Alpha',
        teamLeaderEmployeeId: 'LEAD-ALPHA',
        active: true,
      },
      {
        teamId: 'TEAM-02',
        slotNumber: 2,
        name: 'Beta',
        teamLeaderEmployeeId: 'LEAD-BETA',
        active: true,
      },
    ];

    vi.spyOn(WeeklyPerformance, 'findOne').mockReturnValue({
      lean: () => Promise.resolve(mockWeek),
      sort: () => ({ lean: () => Promise.resolve(mockWeek) }),
    } as any);

    vi.spyOn(WeeklyRanking, 'find').mockReturnValue({
      sort: () => ({ limit: () => ({ lean: () => Promise.resolve(mockRankings) }) }),
    } as any);

    vi.spyOn(Employee, 'find').mockImplementation(((filter: any) => {
      const ids = filter?.employeeId?.$in || [];
      const found = mockEmployees.filter((e) => ids.includes(e.employeeId));
      return { lean: () => Promise.resolve(found) };
    }) as any);

    vi.spyOn(Team, 'find').mockReturnValue({
      lean: () => Promise.resolve(mockTeams),
    } as any);

    const result = await calculateTopTeamLeaderFromPublished();

    expect(result.published).toBe(true);
    expect(result.isTie).toBe(false);
    expect(result.maxEmployeeCount).toBe(4);
    expect(result.teamName).toBe('Alpha');
    expect(result.employeeCount).toBe(4);
    expect(result.teamLeaderEmployeeId).toBe('LEAD-ALPHA');
    expect(result.teamLeaderName).toBe('Sophia Leader');
    expect(result.teamLeaderDesignation).toBe('Alpha Team Lead');
    expect(result.teamLeaderImageUrl).toContain('cloudinary.com');
    expect(result.winningTeams).toHaveLength(1);
    expect(result.winningTeams[0].teamName).toBe('Alpha');
  });

  it('handles ties fairly when 2 or more teams tie for highest count', async () => {
    const mockWeek = {
      weekId: '2026-W42',
      title: 'Week 42 Drive',
      weekStartDate: new Date('2026-10-12'),
      weekEndDate: new Date('2026-10-18'),
      status: 'published',
      isCurrent: true,
    };

    // Alpha: 3, Beta: 3, Gamma: 2, Delta: 2 (Alpha & Beta tie with 3)
    const mockRankings = [
      { employeeId: 'EMP-A1', rank: 1, performanceScore: 990 },
      { employeeId: 'EMP-A2', rank: 2, performanceScore: 980 },
      { employeeId: 'EMP-A3', rank: 3, performanceScore: 970 },
      { employeeId: 'EMP-B1', rank: 4, performanceScore: 960 },
      { employeeId: 'EMP-B2', rank: 5, performanceScore: 950 },
      { employeeId: 'EMP-B3', rank: 6, performanceScore: 940 },
      { employeeId: 'EMP-C1', rank: 7, performanceScore: 930 },
      { employeeId: 'EMP-C2', rank: 8, performanceScore: 920 },
      { employeeId: 'EMP-D1', rank: 9, performanceScore: 910 },
      { employeeId: 'EMP-D2', rank: 10, performanceScore: 900 },
    ];

    const mockEmployees = [
      { employeeId: 'EMP-A1', fullName: 'Alice A1', team: 'Alpha' },
      { employeeId: 'EMP-A2', fullName: 'Alice A2', team: 'Alpha' },
      { employeeId: 'EMP-A3', fullName: 'Alice A3', team: 'Alpha' },
      { employeeId: 'EMP-B1', fullName: 'Bob B1', team: 'Beta' },
      { employeeId: 'EMP-B2', fullName: 'Bob B2', team: 'Beta' },
      { employeeId: 'EMP-B3', fullName: 'Bob B3', team: 'Beta' },
      { employeeId: 'EMP-C1', fullName: 'Carol C1', team: 'Gamma' },
      { employeeId: 'EMP-C2', fullName: 'Carol C2', team: 'Gamma' },
      { employeeId: 'EMP-D1', fullName: 'Dave D1', team: 'Delta' },
      { employeeId: 'EMP-D2', fullName: 'Dave D2', team: 'Delta' },
      { employeeId: 'LEAD-A', fullName: 'Alpha Leader', team: 'Alpha', designation: 'Lead A', imageUrl: 'url-a' },
      { employeeId: 'LEAD-B', fullName: 'Beta Leader', team: 'Beta', designation: 'Lead B', imageUrl: 'url-b' },
    ];

    const mockTeams = [
      { teamId: 'TEAM-01', slotNumber: 1, name: 'Alpha', teamLeaderEmployeeId: 'LEAD-A', active: true },
      { teamId: 'TEAM-02', slotNumber: 2, name: 'Beta', teamLeaderEmployeeId: 'LEAD-B', active: true },
    ];

    vi.spyOn(WeeklyPerformance, 'findOne').mockReturnValue({
      lean: () => Promise.resolve(mockWeek),
      sort: () => ({ lean: () => Promise.resolve(mockWeek) }),
    } as any);

    vi.spyOn(WeeklyRanking, 'find').mockReturnValue({
      sort: () => ({ limit: () => ({ lean: () => Promise.resolve(mockRankings) }) }),
    } as any);

    vi.spyOn(Employee, 'find').mockImplementation(((filter: any) => {
      const ids = filter?.employeeId?.$in || [];
      const found = mockEmployees.filter((e) => ids.includes(e.employeeId));
      return { lean: () => Promise.resolve(found) };
    }) as any);

    vi.spyOn(Team, 'find').mockReturnValue({
      lean: () => Promise.resolve(mockTeams),
    } as any);

    const result = await calculateTopTeamLeaderFromPublished();

    expect(result.published).toBe(true);
    expect(result.isTie).toBe(true);
    expect(result.maxEmployeeCount).toBe(3);
    expect(result.winningTeams).toHaveLength(2);
    const teamNames = result.winningTeams.map((t) => t.teamName);
    expect(teamNames).toContain('Alpha');
    expect(teamNames).toContain('Beta');
    expect(result.winningTeams[0].employeeCount).toBe(3);
    expect(result.winningTeams[1].employeeCount).toBe(3);
  });

  it('handles fewer than 10 published employees correctly', async () => {
    const mockWeek = {
      weekId: '2026-W42',
      title: 'Short Week',
      weekStartDate: new Date('2026-10-12'),
      weekEndDate: new Date('2026-10-18'),
      status: 'published',
      isCurrent: true,
    };

    // Only 3 employees published: 2 in Alpha, 1 in Beta
    const mockRankings = [
      { employeeId: 'EMP-1', rank: 1, performanceScore: 990 },
      { employeeId: 'EMP-2', rank: 2, performanceScore: 980 },
      { employeeId: 'EMP-3', rank: 3, performanceScore: 970 },
    ];

    const mockEmployees = [
      { employeeId: 'EMP-1', fullName: 'Person 1', team: 'Alpha' },
      { employeeId: 'EMP-2', fullName: 'Person 2', team: 'Alpha' },
      { employeeId: 'EMP-3', fullName: 'Person 3', team: 'Beta' },
      { employeeId: 'LEAD-1', fullName: 'Alpha Boss', team: 'Alpha', designation: 'Boss', imageUrl: 'boss.jpg' },
    ];

    const mockTeams = [
      { teamId: 'TEAM-01', slotNumber: 1, name: 'Alpha', teamLeaderEmployeeId: 'LEAD-1', active: true },
    ];

    vi.spyOn(WeeklyPerformance, 'findOne').mockReturnValue({
      lean: () => Promise.resolve(mockWeek),
      sort: () => ({ lean: () => Promise.resolve(mockWeek) }),
    } as any);

    vi.spyOn(WeeklyRanking, 'find').mockReturnValue({
      sort: () => ({ limit: () => ({ lean: () => Promise.resolve(mockRankings) }) }),
    } as any);

    vi.spyOn(Employee, 'find').mockImplementation(((filter: any) => {
      const ids = filter?.employeeId?.$in || [];
      const found = mockEmployees.filter((e) => ids.includes(e.employeeId));
      return { lean: () => Promise.resolve(found) };
    }) as any);

    vi.spyOn(Team, 'find').mockReturnValue({
      lean: () => Promise.resolve(mockTeams),
    } as any);

    const result = await calculateTopTeamLeaderFromPublished();

    expect(result.published).toBe(true);
    expect(result.isTie).toBe(false);
    expect(result.maxEmployeeCount).toBe(2);
    expect(result.teamName).toBe('Alpha');
    expect(result.totalPublishedPerformers).toBe(3);
  });

  it('shows missing leader fallback info when winning team has no designated leader', async () => {
    const mockWeek = {
      weekId: '2026-W42',
      title: 'Week 42 Drive',
      weekStartDate: new Date('2026-10-12'),
      weekEndDate: new Date('2026-10-18'),
      status: 'published',
      isCurrent: true,
    };

    const mockRankings = [
      { employeeId: 'EMP-Z1', rank: 1, performanceScore: 990 },
      { employeeId: 'EMP-Z2', rank: 2, performanceScore: 980 },
    ];

    const mockEmployees = [
      { employeeId: 'EMP-Z1', fullName: 'Zta Member 1', team: 'Zta' },
      { employeeId: 'EMP-Z2', fullName: 'Zta Member 2', team: 'Zta' },
    ];

    // Zta has teamLeaderEmployeeId: null
    const mockTeams = [
      { teamId: 'TEAM-08', slotNumber: 8, name: 'Zta', teamLeaderEmployeeId: null, active: true },
    ];

    vi.spyOn(WeeklyPerformance, 'findOne').mockReturnValue({
      lean: () => Promise.resolve(mockWeek),
      sort: () => ({ lean: () => Promise.resolve(mockWeek) }),
    } as any);

    vi.spyOn(WeeklyRanking, 'find').mockReturnValue({
      sort: () => ({ limit: () => ({ lean: () => Promise.resolve(mockRankings) }) }),
    } as any);

    vi.spyOn(Employee, 'find').mockImplementation(((filter: any) => {
      const ids = filter?.employeeId?.$in || [];
      const found = mockEmployees.filter((e) => ids.includes(e.employeeId));
      return { lean: () => Promise.resolve(found) };
    }) as any);

    vi.spyOn(Team, 'find').mockReturnValue({
      lean: () => Promise.resolve(mockTeams),
    } as any);

    const result = await calculateTopTeamLeaderFromPublished();

    expect(result.published).toBe(true);
    expect(result.teamName).toBe('Zta');
    expect(result.employeeCount).toBe(2);
    expect(result.teamLeader).toBeNull();
    expect(result.winningTeams[0].hasConfiguredLeader).toBe(false);
  });

  it('does not calculate a winner when no weekly leaderboard is published', async () => {
    vi.spyOn(WeeklyPerformance, 'findOne').mockReturnValue({
      lean: () => Promise.resolve(null),
      sort: () => ({ lean: () => Promise.resolve(null) }),
    } as any);

    const result = await calculateTopTeamLeaderFromPublished();

    expect(result.published).toBe(false);
    expect(result.winningTeams).toHaveLength(0);
    expect(result.maxEmployeeCount).toBe(0);
  });

  it('never selects a team that has 0 employees in the Top 10', async () => {
    const mockWeek = {
      weekId: '2026-W42',
      status: 'published',
      isCurrent: true,
    };

    // Only Alpha has employees in Top 10. Beta, Gamma, etc. have 0.
    const mockRankings = [
      { employeeId: 'EMP-A1', rank: 1, performanceScore: 990 },
    ];

    const mockEmployees = [
      { employeeId: 'EMP-A1', fullName: 'Alice', team: 'Alpha' },
      { employeeId: 'LEAD-A', fullName: 'Alpha Lead', team: 'Alpha' },
      { employeeId: 'LEAD-B', fullName: 'Beta Lead', team: 'Beta' },
    ];

    const mockTeams = [
      { teamId: 'TEAM-01', slotNumber: 1, name: 'Alpha', teamLeaderEmployeeId: 'LEAD-A', active: true },
      { teamId: 'TEAM-02', slotNumber: 2, name: 'Beta', teamLeaderEmployeeId: 'LEAD-B', active: true },
    ];

    vi.spyOn(WeeklyPerformance, 'findOne').mockReturnValue({
      lean: () => Promise.resolve(mockWeek),
      sort: () => ({ lean: () => Promise.resolve(mockWeek) }),
    } as any);

    vi.spyOn(WeeklyRanking, 'find').mockReturnValue({
      sort: () => ({ limit: () => ({ lean: () => Promise.resolve(mockRankings) }) }),
    } as any);

    vi.spyOn(Employee, 'find').mockImplementation(((filter: any) => {
      const ids = filter?.employeeId?.$in || [];
      const found = mockEmployees.filter((e) => ids.includes(e.employeeId));
      return { lean: () => Promise.resolve(found) };
    }) as any);

    vi.spyOn(Team, 'find').mockReturnValue({
      lean: () => Promise.resolve(mockTeams),
    } as any);

    const result = await calculateTopTeamLeaderFromPublished();

    expect(result.published).toBe(true);
    expect(result.winningTeams).toHaveLength(1);
    expect(result.winningTeams[0].teamName).toBe('Alpha');
    // Beta must not be in winningTeams
    const hasBeta = result.winningTeams.some((t) => t.teamName === 'Beta');
    expect(hasBeta).toBe(false);
  });
});

import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { Settings } from '../models/Settings.js';
import { WeeklyPerformance } from '../models/WeeklyPerformance.js';
import { WeeklyRanking } from '../models/WeeklyRanking.js';
import { Employee } from '../models/Employee.js';
import { Team } from '../models/Team.js';

describe('Backend API Endpoints', () => {
  const app = createApp();

  it('GET /api/health returns 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('flexio-tv-backend');
    expect(res.body).toHaveProperty('uptime');
  });

  it('GET /api/employees rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/employees');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Authentication required');
  });

  it('GET /api/weeks rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/weeks');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Authentication required');
  });

  it('GET /api/settings rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Authentication required');
  });

  it('GET /api/teams rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/teams');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Authentication required');
  });

  it('POST /api/employees rejects unauthenticated write requests with 401', async () => {
    const res = await request(app).post('/api/employees').send({
      fullName: 'Hacker Name',
      employeeId: 'EMP-9999',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Authentication required');
  });

  it('PUT /api/settings rejects unauthenticated write requests with 401', async () => {
    const res = await request(app).put('/api/settings').send({
      companyName: 'Unauthorized Corp',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Authentication required');
  });

  it('POST /api/weeks/publish-top10 rejects unauthenticated write requests with 401', async () => {
    const res = await request(app).post('/api/weeks/publish-top10').send({
      weekId: '2026-W99',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Authentication required');
  });

  it('PUT /api/teams rejects unauthenticated write requests with 401', async () => {
    const res = await request(app).put('/api/teams').send({
      teams: [{ name: 'Hacked Team', slotNumber: 1 }],
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Authentication required');
  });

  it('GET /api/display/current returns sanitized response when no week is published', async () => {
    vi.spyOn(Settings, 'findOne').mockResolvedValue({
      companyName: 'Flexio Global Technologies',
      companyLogoUrl: '',
      motivationalMessage: 'EXCELLENCE DESERVES RECOGNITION',
      carouselIntervalSeconds: 5,
      dataRefreshIntervalSeconds: 60,
    } as any);

    vi.spyOn(WeeklyPerformance, 'findOne').mockReturnValue({
      lean: () => Promise.resolve(null),
      sort: () => ({
        lean: () => Promise.resolve(null),
      }),
    } as any);

    const res = await request(app).get('/api/display/current');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.published).toBe(false);
    expect(res.body.message).toBe('Weekly rankings will be announced soon.');
    expect(res.body.settings.companyName).toBe('Flexio Global Technologies');
  });

  it('GET /api/display/current returns published performers and hides sensitive credentials', async () => {
    vi.spyOn(Settings, 'findOne').mockResolvedValue({
      companyName: 'Flexio Global Technologies',
      companyLogoUrl: '',
      motivationalMessage: 'EXCELLENCE DESERVES RECOGNITION',
      carouselIntervalSeconds: 5,
      dataRefreshIntervalSeconds: 60,
    } as any);

    const mockWeek = {
      weekId: '2026-W42',
      title: 'Week 42 Drive',
      weekStartDate: new Date('2026-10-12'),
      weekEndDate: new Date('2026-10-18'),
      status: 'published',
      isCurrent: true,
      publishedAt: new Date(),
    };

    vi.spyOn(WeeklyPerformance, 'findOne').mockReturnValue({
      lean: () => Promise.resolve(mockWeek),
      sort: () => ({
        lean: () => Promise.resolve(mockWeek),
      }),
    } as any);

    vi.spyOn(WeeklyRanking, 'find').mockReturnValue({
      sort: () => ({
        limit: () => ({
          lean: () =>
            Promise.resolve([
              {
                weekId: '2026-W42',
                employeeId: 'EMP-1001',
                rank: 1,
                performanceScore: 994,
                achievementDescription: 'Record quarterly revenue',
              },
            ]),
        }),
      }),
    } as any);

    vi.spyOn(Employee, 'find').mockReturnValue({
      lean: () =>
        Promise.resolve([
          {
            employeeId: 'EMP-1001',
            fullName: 'Sophia Montgomery',
            team: 'Sales & Revenue',
            designation: 'Senior Account Executive',
            department: 'Sales & Revenue',
            imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
            active: true,
          },
        ]),
    } as any);

    vi.spyOn(Team, 'find').mockReturnValue({
      lean: () =>
        Promise.resolve([
          {
            teamId: 'TEAM-01',
            slotNumber: 1,
            name: 'Sales & Revenue',
            teamLeaderEmployeeId: 'EMP-1001',
            active: true,
          },
        ]),
    } as any);

    const res = await request(app).get('/api/display/current');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.published).toBe(true);
    expect(res.body.leaderboard.performers).toHaveLength(1);
    expect(res.body.leaderboard.performers[0].fullName).toBe('Sophia Montgomery');
    expect(res.body.leaderboard.performers[0].team).toBe('Sales & Revenue');
    expect(res.body.leaderboard.performers[0].rank).toBe(1);
    expect(res.body.leaderboard.performers[0].performanceScore).toBe(994);
    expect(res.body.topTeamLeader).toBeDefined();
    expect(res.body.topTeamLeader.teamName).toBe('Sales & Revenue');
    expect(res.body.topTeamLeader.employeeCount).toBe(1);
    // Security assertion: no sensitive fields
    expect(res.body).not.toHaveProperty('passwordHash');
    expect(res.body.leaderboard.performers[0]).not.toHaveProperty('salary');
  });

  it('GET /api/display/team-leader returns winning team leader recognition', async () => {
    const res = await request(app).get('/api/display/team-leader');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.published).toBe(true);
    expect(res.body.teamName).toBe('Sales & Revenue');
    expect(res.body.employeeCount).toBe(1);
    expect(res.body.teamLeaderName).toBe('Sophia Montgomery');
  });

});

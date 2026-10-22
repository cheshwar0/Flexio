import { Request, Response, NextFunction } from 'express';
import { WeeklyPerformance } from '../models/WeeklyPerformance.js';
import { WeeklyRanking } from '../models/WeeklyRanking.js';
import { Employee } from '../models/Employee.js';
import { Team } from '../models/Team.js';
import { Settings } from '../models/Settings.js';
import { ENV } from '../config/env.js';
import { calculateTopTeamLeaderFromPublished } from '../services/teamLeaderService.js';

export async function getCurrentDisplayLeaderboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Fetch system settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        companyName: ENV.COMPANY_NAME || 'Flexio Technologies',
        companyLogoUrl: ENV.COMPANY_LOGO_URL || '',
        motivationalMessage: 'EXCELLENCE DESERVES RECOGNITION',
        carouselIntervalSeconds: 5,
        dataRefreshIntervalSeconds: 60,
        teamLeaderSlideDurationSeconds: 5,
      });
    }

    // 2. Fetch the current active published weekly performance (only 1 is active on TV)
    let currentWeek = await WeeklyPerformance.findOne({ isCurrent: true, status: 'published' }).lean();

    // Fallback to most recently published if isCurrent flag is not yet populated
    if (!currentWeek) {
      currentWeek = await WeeklyPerformance.findOne({ status: 'published' })
        .sort({ publishedAt: -1, weekEndDate: -1 })
        .lean();
    }

    if (!currentWeek) {
      res.json({
        success: true,
        published: false,
        message: 'Weekly rankings will be announced soon.',
        settings: {
          companyName: settings.companyName,
          companyLogoUrl: settings.companyLogoUrl,
          presentedBy: settings.presentedBy || 'Alpha Team',
          motivationalMessage: settings.motivationalMessage,
          carouselIntervalSeconds: settings.carouselIntervalSeconds,
          dataRefreshIntervalSeconds: settings.dataRefreshIntervalSeconds,
          teamLeaderSlideDurationSeconds: settings.teamLeaderSlideDurationSeconds || 5,
        },
        leaderboard: null,
        topTeamLeader: null,
      });
      return;
    }

    // 3. Fetch top rankings for this published week (max 10)
    const rankings = await WeeklyRanking.find({ weekId: currentWeek.weekId })
      .sort({ rank: 1 })
      .limit(10)
      .lean();

    // 4. Enrich with public employee details from permanent directory and team slogans
    const employeeIds = rankings.map((r) => r.employeeId);
    const [employees, teams] = await Promise.all([
      Employee.find({ employeeId: { $in: employeeIds } }).lean(),
      Team.find().lean(),
    ]);
    const empMap = new Map(employees.map((e) => [e.employeeId, e]));
    const teamMap = new Map(teams.map((t) => [t.name.trim().toLowerCase(), t]));

    const performers = rankings.map((r) => {
      const emp = empMap.get(r.employeeId);
      const teamName = emp ? emp.team : 'General';
      const teamDoc = teamMap.get(teamName.trim().toLowerCase());
      const teamSlogan = teamDoc?.slogan || teamDoc?.description || '';

      return {
        rank: r.rank,
        employeeId: r.employeeId,
        fullName: emp ? emp.fullName : 'Top Performer',
        team: teamName,
        teamSlogan,
        designation: emp ? emp.designation : 'Team Member',
        department: emp?.department || emp?.team || 'General',
        imageUrl: emp?.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        performanceScore: r.performanceScore,
        achievementDescription: r.achievementDescription || '',
      };
    });

    // 5. Calculate dynamically the winning team leader recognition slide data
    const topTeamLeader = await calculateTopTeamLeaderFromPublished({
      currentWeek,
      rankings,
      employees,
    });


    res.json({
      success: true,
      published: true,
      fetchedAt: new Date().toISOString(),
      settings: {
        companyName: settings.companyName,
        companyLogoUrl: settings.companyLogoUrl,
        presentedBy: settings.presentedBy || 'Alpha Team',
        motivationalMessage: settings.motivationalMessage,
        carouselIntervalSeconds: settings.carouselIntervalSeconds,
        dataRefreshIntervalSeconds: settings.dataRefreshIntervalSeconds,
        teamLeaderSlideDurationSeconds: settings.teamLeaderSlideDurationSeconds || 5,
      },
      leaderboard: {
        weekId: currentWeek.weekId,
        title: currentWeek.title,
        presentedBy: (currentWeek as any).presentedBy || settings.presentedBy || 'Alpha Team',
        weekStartDate: currentWeek.weekStartDate,
        weekEndDate: currentWeek.weekEndDate,
        publishedAt: currentWeek.publishedAt,
        performers,
      },
      topTeamLeader,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Dedicated endpoint for retrieving the Top Team Leader recognition slide data.
 * Public and read-only for TV displays or client integrations.
 */
export async function getTopTeamLeaderDisplay(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await calculateTopTeamLeaderFromPublished();
    res.json(result);
  } catch (err) {
    next(err);
  }
}


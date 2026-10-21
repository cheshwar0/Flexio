import { Request, Response, NextFunction } from 'express';
import { WeeklyPerformance } from '../models/WeeklyPerformance.js';
import { WeeklyRanking } from '../models/WeeklyRanking.js';
import { Employee } from '../models/Employee.js';
import { calculateAutoRankings, validateManualRankings } from '../services/rankingService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getWeeks(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const weeks = await WeeklyPerformance.find().sort({ isCurrent: -1, weekEndDate: -1 });
    res.json({ success: true, count: weeks.length, weeks });
  } catch (err) {
    next(err);
  }
}

export async function getWeekById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const week = await WeeklyPerformance.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { weekId: id }],
    });

    if (!week) {
      res.status(404).json({ success: false, message: 'Performance week not found.' });
      return;
    }

    const rawRankings = await WeeklyRanking.find({ weekId: week.weekId }).sort({ rank: 1 });

    // Retrieve permanent employee details from database automatically
    const employeeIds = rawRankings.map((r) => r.employeeId);
    const employees = await Employee.find({ employeeId: { $in: employeeIds } });
    const empMap = new Map(employees.map((e) => [e.employeeId, e]));

    const enrichedRankings = rawRankings.map((r) => {
      const emp = empMap.get(r.employeeId);
      return {
        _id: r._id,
        rank: r.rank,
        employeeId: r.employeeId,
        performanceScore: r.performanceScore,
        achievementDescription: r.achievementDescription,
        fullName: emp ? emp.fullName : 'Former Employee',
        team: emp ? emp.team : 'N/A',
        designation: emp ? emp.designation : 'N/A',
        department: emp ? emp.department : 'N/A',
        imageUrl: emp ? emp.imageUrl : '',
        active: emp ? emp.active : false,
      };
    });

    res.json({
      success: true,
      week,
      rankings: enrichedRankings,
    });
  } catch (err) {
    next(err);
  }
}

export async function createWeek(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { weekId, title, presentedBy, weekStartDate, weekEndDate } = req.body;

    if (!weekId || !title || !weekStartDate || !weekEndDate) {
      res.status(400).json({
        success: false,
        message: 'Week ID (e.g. 2026-W42), title, start date, and end date are required.',
      });
      return;
    }

    const cleanWeekId = weekId.trim().toUpperCase();
    const existing = await WeeklyPerformance.findOne({ weekId: cleanWeekId });
    if (existing) {
      res.status(400).json({
        success: false,
        message: `Performance week "${cleanWeekId}" already exists.`,
      });
      return;
    }

    const start = new Date(weekStartDate);
    const end = new Date(weekEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid start or end date.' });
      return;
    }
    if (end < start) {
      res.status(400).json({ success: false, message: 'Week end date cannot be before start date.' });
      return;
    }

    const week = await WeeklyPerformance.create({
      weekId: cleanWeekId,
      title: title.trim(),
      presentedBy: presentedBy ? presentedBy.trim() : 'Alpha Team',
      weekStartDate: start,
      weekEndDate: end,
      status: 'draft',
      isCurrent: false,
      createdBy: req.admin?.name || 'HR Admin',
    });

    res.status(201).json({
      success: true,
      message: 'Performance week draft created successfully.',
      week,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateWeek(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { title, presentedBy, weekStartDate, weekEndDate, rankings, mode, allowTies } = req.body;

    const week = await WeeklyPerformance.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { weekId: id }],
    });

    if (!week) {
      res.status(404).json({ success: false, message: 'Performance week not found.' });
      return;
    }

    if (title) week.title = title.trim();
    if (presentedBy !== undefined) week.presentedBy = presentedBy.trim();
    if (weekStartDate) week.weekStartDate = new Date(weekStartDate);
    if (weekEndDate) week.weekEndDate = new Date(weekEndDate);
    await week.save();

    // If rankings are provided, validate and update them
    if (rankings && Array.isArray(rankings)) {
      let validation;
      if (mode === 'manual') {
        validation = validateManualRankings(rankings, Boolean(allowTies));
      } else {
        validation = calculateAutoRankings(rankings, Boolean(allowTies));
      }

      if (!validation.valid || !validation.rankings) {
        res.status(400).json({ success: false, message: validation.error });
        return;
      }

      // Verify that all employee IDs exist in the permanent directory
      const empIds = validation.rankings.map((r) => r.employeeId);
      const foundEmployees = await Employee.find({ employeeId: { $in: empIds } });
      const foundIds = new Set(foundEmployees.map((e) => e.employeeId));

      for (const empId of empIds) {
        if (!foundIds.has(empId)) {
          res.status(400).json({
            success: false,
            message: `Employee "${empId}" does not exist in the permanent employee directory.`,
          });
          return;
        }
      }

      await WeeklyRanking.deleteMany({ weekId: week.weekId });
      const docsToInsert = validation.rankings.map((r) => ({
        weekId: week.weekId,
        employeeId: r.employeeId,
        rank: r.rank,
        performanceScore: r.performanceScore,
        achievementDescription: r.achievementDescription || '',
      }));
      await WeeklyRanking.insertMany(docsToInsert);
    }

    res.json({
      success: true,
      message: 'Weekly performance details and rankings saved successfully.',
      week,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Publishes a week and atomically replaces the currently displayed leaderboard on company TVs.
 */
export async function publishWeek(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const week = await WeeklyPerformance.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { weekId: id }],
    });

    if (!week) {
      res.status(404).json({ success: false, message: 'Performance week not found.' });
      return;
    }

    const rankingCount = await WeeklyRanking.countDocuments({ weekId: week.weekId });
    if (rankingCount === 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot publish a leaderboard with 0 rankings. Please add employee rankings first.',
      });
      return;
    }

    // Atomically archive any previous active leaderboard
    await WeeklyPerformance.updateMany({ isCurrent: true }, { isCurrent: false });

    // Set this week as the active published leaderboard
    week.status = 'published';
    week.isCurrent = true;
    week.publishedAt = new Date();
    await week.save();

    res.json({
      success: true,
      message: `Week ${week.weekId} rankings are now LIVE on office televisions! (Previous leaderboard archived)`,
      week,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Dedicated endpoint for the "Select Weekly Top 10" workflow:
 * Validates, saves, and replaces the currently displayed weekly leaderboard in one atomic operation.
 */
export async function publishNewWeeklyTop10(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { weekId, title, presentedBy, weekStartDate, weekEndDate, rankings, mode, allowTies } = req.body;

    if (!weekId || !title || !weekStartDate || !weekEndDate) {
      res.status(400).json({
        success: false,
        message: 'Week ID, title, start date, and end date are required.',
      });
      return;
    }

    if (!rankings || !Array.isArray(rankings) || rankings.length === 0) {
      res.status(400).json({
        success: false,
        message: 'At least 1 employee must be selected for the weekly Top 10.',
      });
      return;
    }

    if (rankings.length > 10) {
      res.status(400).json({
        success: false,
        message: 'The leaderboard cannot exceed 10 performers.',
      });
      return;
    }

    // Validate rankings
    let validation;
    if (mode === 'manual') {
      validation = validateManualRankings(rankings, Boolean(allowTies));
    } else {
      validation = calculateAutoRankings(rankings, Boolean(allowTies));
    }

    if (!validation.valid || !validation.rankings) {
      res.status(400).json({ success: false, message: validation.error });
      return;
    }

    // Verify all selected employee IDs exist in the permanent directory
    const empIds = validation.rankings.map((r) => r.employeeId);
    const existingEmployees = await Employee.find({ employeeId: { $in: empIds } });
    const existingIdSet = new Set(existingEmployees.map((e) => e.employeeId));

    for (const empId of empIds) {
      if (!existingIdSet.has(empId)) {
        res.status(400).json({
          success: false,
          message: `Employee "${empId}" does not exist in the permanent employee directory.`,
        });
        return;
      }
    }

    const cleanWeekId = weekId.trim().toUpperCase();

    // 1. Atomically archive currently active leaderboard on TV
    await WeeklyPerformance.updateMany({ isCurrent: true }, { isCurrent: false });

    // 2. Find or create the week record
    let week = await WeeklyPerformance.findOne({ weekId: cleanWeekId });
    if (!week) {
      week = new WeeklyPerformance({
        weekId: cleanWeekId,
        createdBy: req.admin?.name || 'HR Admin',
      });
    }

    week.title = title.trim();
    if (presentedBy !== undefined) {
      week.presentedBy = presentedBy.trim();
    } else if (!week.presentedBy) {
      week.presentedBy = 'Alpha Team';
    }
    week.weekStartDate = new Date(weekStartDate);
    week.weekEndDate = new Date(weekEndDate);
    week.status = 'published';
    week.isCurrent = true;
    week.publishedAt = new Date();
    await week.save();

    // 3. Atomically overwrite rankings for this week
    await WeeklyRanking.deleteMany({ weekId: week.weekId });
    const docsToInsert = validation.rankings.map((r) => ({
      weekId: week.weekId,
      employeeId: r.employeeId,
      rank: r.rank,
      performanceScore: r.performanceScore,
      achievementDescription: r.achievementDescription || '',
    }));
    await WeeklyRanking.insertMany(docsToInsert);

    res.json({
      success: true,
      message: `Weekly Top 10 for ${week.weekId} published successfully! Company TV display is now showing the new leaderboard.`,
      week,
      rankingsCount: docsToInsert.length,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteWeek(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const week = await WeeklyPerformance.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { weekId: id }],
    });

    if (!week) {
      res.status(404).json({ success: false, message: 'Performance week not found.' });
      return;
    }

    await WeeklyRanking.deleteMany({ weekId: week.weekId });
    await WeeklyPerformance.deleteOne({ _id: week._id });

    res.json({
      success: true,
      message: `Performance week ${week.weekId} and its rankings were removed successfully.`,
    });
  } catch (err) {
    next(err);
  }
}

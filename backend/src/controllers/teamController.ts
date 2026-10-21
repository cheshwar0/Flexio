import { Request, Response, NextFunction } from 'express';
import { Team } from '../models/Team.js';
import { Employee } from '../models/Employee.js';

// Default initial 8 team configuration slots with demo leader references
export const DEFAULT_8_TEAMS = [
  { teamId: 'TEAM-01', slotNumber: 1, name: 'Alpha', description: 'Alpha Team', teamLeaderEmployeeId: 'EMP-1001', active: true },
  { teamId: 'TEAM-02', slotNumber: 2, name: 'Beta', description: 'Beta Team', teamLeaderEmployeeId: 'EMP-1002', active: true },
  { teamId: 'TEAM-03', slotNumber: 3, name: 'Gamma', description: 'Gamma Team', teamLeaderEmployeeId: 'EMP-1003', active: true },
  { teamId: 'TEAM-04', slotNumber: 4, name: 'Delta', description: 'Delta Team', teamLeaderEmployeeId: 'EMP-1004', active: true },
  { teamId: 'TEAM-05', slotNumber: 5, name: 'Omega', description: 'Omega Team', teamLeaderEmployeeId: 'EMP-1005', active: true },
  { teamId: 'TEAM-06', slotNumber: 6, name: 'Sigma', description: 'Sigma Team', teamLeaderEmployeeId: 'EMP-1006', active: true },
  { teamId: 'TEAM-07', slotNumber: 7, name: 'Appex', description: 'Appex Team', teamLeaderEmployeeId: 'EMP-1007', active: true },
  { teamId: 'TEAM-08', slotNumber: 8, name: 'Zta', description: 'Zta Team', teamLeaderEmployeeId: 'EMP-1008', active: true },
];

/**
 * Helper to enrich team documents with their designated leader's employee details
 */
async function enrichTeamsWithLeaders(teams: any[]) {
  const leaderIds = teams
    .map((t) => t.teamLeaderEmployeeId)
    .filter((id): id is string => Boolean(id && typeof id === 'string' && id.trim() !== ''));

  const leaders = await Employee.find({ employeeId: { $in: leaderIds } }).lean();
  const leaderMap = new Map(leaders.map((e) => [e.employeeId.toUpperCase(), e]));

  return teams.map((t) => {
    const leaderId = t.teamLeaderEmployeeId ? t.teamLeaderEmployeeId.toUpperCase() : null;
    const leaderDoc = leaderId ? leaderMap.get(leaderId) : null;
    return {
      _id: t._id,
      teamId: t.teamId || `TEAM-0${t.slotNumber}`,
      slotNumber: t.slotNumber,
      name: t.name,
      description: t.description || '',
      teamLeaderEmployeeId: t.teamLeaderEmployeeId || null,
      active: t.active !== false,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      teamLeader: leaderDoc
        ? {
            employeeId: leaderDoc.employeeId,
            fullName: leaderDoc.fullName,
            designation: leaderDoc.designation,
            imageUrl: leaderDoc.imageUrl,
            team: leaderDoc.team,
          }
        : null,
    };
  });
}

export async function getTeams(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let teams = await Team.find().sort({ slotNumber: 1 });
    if (teams.length === 0) {
      await Team.insertMany(DEFAULT_8_TEAMS);
      teams = await Team.find().sort({ slotNumber: 1 });
    }

    // Migration check: Ensure all existing teams have teamId and active fields
    for (const t of teams) {
      let needsSave = false;
      if (!t.teamId) {
        t.teamId = `TEAM-0${t.slotNumber}`;
        needsSave = true;
      }
      if (t.active === undefined) {
        t.active = true;
        needsSave = true;
      }
      if (needsSave) {
        await t.save();
      }
    }

    const enriched = await enrichTeamsWithLeaders(teams);
    res.json({ success: true, count: enriched.length, teams: enriched });
  } catch (err) {
    next(err);
  }
}

export async function updateTeams(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { teams } = req.body;
    if (!teams || !Array.isArray(teams) || teams.length !== 8) {
      res.status(400).json({
        success: false,
        message: 'Exactly 8 company teams must be configured.',
      });
      return;
    }

    // Verify all 8 teams have names
    for (const t of teams) {
      if (!t.name || t.name.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'All 8 team names must be non-empty.',
        });
        return;
      }
    }

    // Validate that any assigned team leader exists in the permanent employee directory
    const leaderIdsToCheck = teams
      .map((t) => t.teamLeaderEmployeeId)
      .filter((id): id is string => Boolean(id && typeof id === 'string' && id.trim() !== ''))
      .map((id) => id.trim().toUpperCase());

    if (leaderIdsToCheck.length > 0) {
      const foundEmployees = await Employee.find({ employeeId: { $in: leaderIdsToCheck } }).lean();
      const foundIdSet = new Set(foundEmployees.map((e) => e.employeeId.toUpperCase()));

      for (const leaderId of leaderIdsToCheck) {
        if (!foundIdSet.has(leaderId)) {
          res.status(400).json({
            success: false,
            message: `Employee "${leaderId}" assigned as team leader does not exist in the employee directory.`,
          });
          return;
        }
      }
    }

    // Upsert the 8 teams by slotNumber
    for (let i = 0; i < teams.length; i++) {
      const slotNumber = i + 1;
      const teamData = teams[i];
      const leaderId = teamData.teamLeaderEmployeeId && teamData.teamLeaderEmployeeId.trim() !== ''
        ? teamData.teamLeaderEmployeeId.trim().toUpperCase()
        : null;

      await Team.findOneAndUpdate(
        { slotNumber },
        {
          teamId: teamData.teamId || `TEAM-0${slotNumber}`,
          slotNumber,
          name: teamData.name.trim(),
          description: teamData.description?.trim() || '',
          teamLeaderEmployeeId: leaderId,
          active: teamData.active !== false,
        },
        { upsert: true, new: true }
      );
    }

    const updatedTeams = await Team.find().sort({ slotNumber: 1 });
    const enriched = await enrichTeamsWithLeaders(updatedTeams);

    res.json({
      success: true,
      message: '8 company teams and designated team leaders updated successfully.',
      teams: enriched,
    });
  } catch (err) {
    next(err);
  }
}


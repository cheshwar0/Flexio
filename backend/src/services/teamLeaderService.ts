import { WeeklyPerformance } from '../models/WeeklyPerformance.js';
import { WeeklyRanking } from '../models/WeeklyRanking.js';
import { Employee } from '../models/Employee.js';
import { Team } from '../models/Team.js';

export interface LeaderDetails {
  employeeId: string;
  fullName: string;
  designation: string;
  imageUrl: string;
}

export interface WinningTeamLeaderItem {
  teamId: string;
  teamName: string;
  employeeCount: number;
  teamLeaderEmployeeId: string | null;
  teamLeaderName: string | null;
  teamLeaderDesignation: string | null;
  teamLeaderImageUrl: string | null;
  teamLeader: LeaderDetails | null;
  hasConfiguredLeader: boolean;
}

export interface TeamCountSummary {
  teamName: string;
  count: number;
}

export interface TopTeamLeaderRecognitionResult {
  success: boolean;
  published: boolean;
  message?: string;
  weekId?: string;
  weekTitle?: string;
  weekStartDate?: Date | string;
  weekEndDate?: Date | string;
  publishedAt?: Date | string;
  isTie: boolean;
  maxEmployeeCount: number;
  totalPublishedPerformers: number;
  winningTeams: WinningTeamLeaderItem[];
  allTeamCounts: TeamCountSummary[];
  // Convenient top-level fields for single winner compatibility
  teamId?: string | null;
  teamName?: string | null;
  employeeCount?: number;
  teamLeaderEmployeeId?: string | null;
  teamLeaderName?: string | null;
  teamLeaderDesignation?: string | null;
  teamLeaderImageUrl?: string | null;
  teamLeader?: LeaderDetails | null;
}


/**
 * Calculates the winning team leader(s) dynamically from the currently published Top 10 performers.
 * Does not calculate from draft or unpublished rankings.
 * Handles single winners, ties, fewer than 10 performers, missing leaders, and zero-employee teams.
 */
export async function calculateTopTeamLeaderFromPublished(preloaded?: {
  currentWeek?: any;
  rankings?: any[];
  employees?: any[];
}): Promise<TopTeamLeaderRecognitionResult> {
  // 1. Fetch the active published weekly performance if not preloaded
  let currentWeek = preloaded?.currentWeek;
  if (!currentWeek) {
    currentWeek = await WeeklyPerformance.findOne({ isCurrent: true, status: 'published' }).lean();

    if (!currentWeek) {
      currentWeek = await WeeklyPerformance.findOne({ status: 'published' })
        .sort({ publishedAt: -1, weekEndDate: -1 })
        .lean();
    }
  }

  if (!currentWeek) {
    return {
      success: true,
      published: false,
      message: 'Weekly rankings will be announced soon. No published leaderboard found.',
      isTie: false,
      maxEmployeeCount: 0,
      totalPublishedPerformers: 0,
      winningTeams: [],
      allTeamCounts: [],
    };
  }

  // 2. Fetch the published rankings for this week (up to 10 performers, sorted by rank)
  let rankings = preloaded?.rankings;
  if (!rankings) {
    rankings = await WeeklyRanking.find({ weekId: currentWeek.weekId })
      .sort({ rank: 1 })
      .limit(10)
      .lean();
  }

  if (rankings.length === 0) {
    return {
      success: true,
      published: true,
      message: 'No employee rankings found for the active published week.',
      weekId: currentWeek.weekId,
      weekTitle: currentWeek.title,
      weekStartDate: currentWeek.weekStartDate,
      weekEndDate: currentWeek.weekEndDate,
      publishedAt: currentWeek.publishedAt,
      isTie: false,
      maxEmployeeCount: 0,
      totalPublishedPerformers: 0,
      winningTeams: [],
      allTeamCounts: [],
    };
  }

  // 3. Enrich rankings with employee records to determine their assigned teams
  const employeeIds = rankings.map((r: any) => r.employeeId);
  let employees = preloaded?.employees;
  if (!employees) {
    employees = await Employee.find({ employeeId: { $in: employeeIds } }).lean();
  }
  const empMap = new Map((employees || []).map((e: any) => [e.employeeId, e]));


  // 4. Count employees per team dynamically from published Top 10 data
  // Case-insensitive team grouping
  const teamCountMap = new Map<string, { originalName: string; count: number }>();

  for (const r of rankings) {
    const emp = empMap.get(r.employeeId);
    if (!emp || !emp.team || emp.team.trim() === '') {
      continue;
    }
    const cleanTeam = emp.team.trim();
    const key = cleanTeam.toLowerCase();
    const existing = teamCountMap.get(key) || { originalName: cleanTeam, count: 0 };
    existing.count += 1;
    teamCountMap.set(key, existing);
  }

  // All teams with at least 1 employee in the published Top 10
  const allTeamCounts: TeamCountSummary[] = Array.from(teamCountMap.values())
    .map((item) => ({ teamName: item.originalName, count: item.count }))
    .sort((a, b) => b.count - a.count);

  if (allTeamCounts.length === 0) {
    return {
      success: true,
      published: true,
      message: 'No valid team assignments found among published performers.',
      weekId: currentWeek.weekId,
      weekTitle: currentWeek.title,
      weekStartDate: currentWeek.weekStartDate,
      weekEndDate: currentWeek.weekEndDate,
      publishedAt: currentWeek.publishedAt,
      isTie: false,
      maxEmployeeCount: 0,
      totalPublishedPerformers: rankings.length,
      winningTeams: [],
      allTeamCounts: [],
    };
  }

  // 5. Determine the maximum representation count (> 0)
  const maxEmployeeCount = Math.max(...allTeamCounts.map((t) => t.count));

  if (maxEmployeeCount <= 0) {
    return {
      success: true,
      published: true,
      message: 'Zero employees found in top performers.',
      weekId: currentWeek.weekId,
      weekTitle: currentWeek.title,
      weekStartDate: currentWeek.weekStartDate,
      weekEndDate: currentWeek.weekEndDate,
      publishedAt: currentWeek.publishedAt,
      isTie: false,
      maxEmployeeCount: 0,
      totalPublishedPerformers: rankings.length,
      winningTeams: [],
      allTeamCounts,
    };
  }

  // 6. Find all teams with count === maxEmployeeCount (handles ties fairly)
  const topTeams = allTeamCounts.filter((t) => t.count === maxEmployeeCount);
  const isTie = topTeams.length > 1;

  // 7. Load all company teams to find team IDs and designated team leaders
  const registeredTeams = await Team.find().lean();
  const registeredTeamMap = new Map(
    registeredTeams.map((t) => [t.name.trim().toLowerCase(), t])
  );

  // 8. Find team leader employee IDs for the top team(s)
  const leaderEmployeeIdsToFetch: string[] = [];
  for (const topTeam of topTeams) {
    const regTeam = registeredTeamMap.get(topTeam.teamName.toLowerCase());
    if (regTeam && regTeam.teamLeaderEmployeeId) {
      leaderEmployeeIdsToFetch.push(regTeam.teamLeaderEmployeeId.trim().toUpperCase());
    }
  }

  const leaderEmployees = await Employee.find({
    employeeId: { $in: leaderEmployeeIdsToFetch },
  }).lean();
  const leaderMap = new Map(leaderEmployees.map((e) => [e.employeeId, e]));

  // 9. Build winning team leader objects
  const winningTeams: WinningTeamLeaderItem[] = topTeams.map((topTeam) => {
    const regTeam = registeredTeamMap.get(topTeam.teamName.toLowerCase());
    const teamId = regTeam?.teamId || `TEAM-${regTeam?.slotNumber || topTeam.teamName.toUpperCase()}`;
    const officialTeamName = regTeam?.name || topTeam.teamName;
    const leaderEmployeeId = regTeam?.teamLeaderEmployeeId ? regTeam.teamLeaderEmployeeId.trim().toUpperCase() : null;

    let leaderDetails: LeaderDetails | null = null;
    if (leaderEmployeeId) {
      const empLeader = leaderMap.get(leaderEmployeeId);
      if (empLeader) {
        leaderDetails = {
          employeeId: empLeader.employeeId,
          fullName: empLeader.fullName,
          designation: empLeader.designation,
          imageUrl: empLeader.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        };
      }
    }

    return {
      teamId,
      teamName: officialTeamName,
      employeeCount: topTeam.count,
      teamLeaderEmployeeId: leaderDetails ? leaderDetails.employeeId : (leaderEmployeeId || null),
      teamLeaderName: leaderDetails ? leaderDetails.fullName : null,
      teamLeaderDesignation: leaderDetails ? leaderDetails.designation : null,
      teamLeaderImageUrl: leaderDetails ? leaderDetails.imageUrl : null,
      teamLeader: leaderDetails,
      hasConfiguredLeader: Boolean(leaderDetails),
    };
  });

  const primaryWinner = winningTeams[0] || null;

  return {
    success: true,
    published: true,
    weekId: currentWeek.weekId,
    weekTitle: currentWeek.title,
    weekStartDate: currentWeek.weekStartDate,
    weekEndDate: currentWeek.weekEndDate,
    publishedAt: currentWeek.publishedAt,
    isTie,
    maxEmployeeCount,
    totalPublishedPerformers: rankings.length,
    winningTeams,
    allTeamCounts,
    // Root level fields for single winner compatibility
    teamId: primaryWinner?.teamId || null,
    teamName: primaryWinner?.teamName || null,
    employeeCount: primaryWinner?.employeeCount || 0,
    teamLeaderEmployeeId: primaryWinner?.teamLeaderEmployeeId || null,
    teamLeaderName: primaryWinner?.teamLeaderName || null,
    teamLeaderDesignation: primaryWinner?.teamLeaderDesignation || null,
    teamLeaderImageUrl: primaryWinner?.teamLeaderImageUrl || null,
    teamLeader: primaryWinner ? (primaryWinner.teamLeader || null) : null,
  };
}

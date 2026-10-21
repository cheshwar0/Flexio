export interface RankingInput {
  employeeId: string;
  rank?: number;
  performanceScore: number;
  achievementDescription?: string;
}

export interface ValidatedRanking {
  employeeId: string;
  rank: number;
  performanceScore: number;
  achievementDescription?: string;
}

export interface RankingValidationResult {
  valid: boolean;
  error?: string;
  rankings?: ValidatedRanking[];
}

/**
 * Validates and sorts rankings automatically by score descending (Rank 1 = highest score).
 */
export function calculateAutoRankings(
  items: RankingInput[],
  allowTies = false
): RankingValidationResult {
  if (!items || items.length === 0) {
    return { valid: false, error: 'Leaderboard must contain at least 1 employee ranking.' };
  }

  if (items.length > 10) {
    return { valid: false, error: 'A weekly leaderboard cannot exceed 10 performers.' };
  }

  // Check for duplicate employee IDs
  const employeeIds = new Set<string>();
  for (const item of items) {
    if (!item.employeeId || item.employeeId.trim() === '') {
      return { valid: false, error: 'Each ranking item must have a valid employee ID.' };
    }
    const cleanId = item.employeeId.trim().toUpperCase();
    if (employeeIds.has(cleanId)) {
      return {
        valid: false,
        error: `Duplicate employee detected: ${cleanId}. An employee can only appear once per leaderboard.`,
      };
    }
    employeeIds.add(cleanId);

    if (item.performanceScore === undefined || item.performanceScore === null || isNaN(item.performanceScore)) {
      return { valid: false, error: `Invalid performance score for employee ${cleanId}.` };
    }
    if (item.performanceScore < 0 || item.performanceScore > 1000) {
      return { valid: false, error: `Performance score for employee ${cleanId} must be between 0 and 1000.` };
    }
  }

  // Sort descending by performance score
  const sorted = [...items].sort((a, b) => b.performanceScore - a.performanceScore);

  let currentRank = 1;
  const validated: ValidatedRanking[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    if (allowTies && i > 0 && item.performanceScore === sorted[i - 1].performanceScore) {
      // Same rank as previous if tie allowed
      validated.push({
        employeeId: item.employeeId.trim().toUpperCase(),
        rank: validated[i - 1].rank,
        performanceScore: item.performanceScore,
        achievementDescription: item.achievementDescription?.trim(),
      });
    } else {
      currentRank = i + 1;
      validated.push({
        employeeId: item.employeeId.trim().toUpperCase(),
        rank: currentRank,
        performanceScore: item.performanceScore,
        achievementDescription: item.achievementDescription?.trim(),
      });
    }
  }

  return { valid: true, rankings: validated };
}

/**
 * Validates manual ranking assignments provided by HR.
 */
export function validateManualRankings(
  items: RankingInput[],
  allowTies = false
): RankingValidationResult {
  if (!items || items.length === 0) {
    return { valid: false, error: 'Leaderboard must contain at least 1 employee ranking.' };
  }

  if (items.length > 10) {
    return { valid: false, error: 'A weekly leaderboard cannot exceed 10 performers.' };
  }

  const employeeIds = new Set<string>();
  const rankSet = new Set<number>();
  const validated: ValidatedRanking[] = [];

  for (const item of items) {
    if (!item.employeeId || item.employeeId.trim() === '') {
      return { valid: false, error: 'Each ranking item must specify a valid employee ID.' };
    }
    const cleanId = item.employeeId.trim().toUpperCase();
    if (employeeIds.has(cleanId)) {
      return {
        valid: false,
        error: `Duplicate employee detected: ${cleanId}. Each employee can only appear once in a week.`,
      };
    }
    employeeIds.add(cleanId);

    if (item.rank === undefined || item.rank === null || isNaN(item.rank) || item.rank < 1 || item.rank > 10) {
      return { valid: false, error: `Invalid rank (${item.rank}) for employee ${cleanId}. Rank must be between 1 and 10.` };
    }

    if (!allowTies && rankSet.has(item.rank)) {
      return {
        valid: false,
        error: `Duplicate rank #${item.rank} assigned. Each employee must have a unique rank (or enable tie handling).`,
      };
    }
    rankSet.add(item.rank);

    if (item.performanceScore === undefined || item.performanceScore === null || isNaN(item.performanceScore)) {
      return { valid: false, error: `Invalid performance score for employee ${cleanId}.` };
    }

    validated.push({
      employeeId: cleanId,
      rank: item.rank,
      performanceScore: item.performanceScore,
      achievementDescription: item.achievementDescription?.trim(),
    });
  }

  // Sort by assigned rank ascending
  validated.sort((a, b) => a.rank - b.rank);

  return { valid: true, rankings: validated };
}

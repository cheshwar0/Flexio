import { describe, it, expect } from 'vitest';
import {
  calculateAutoRankings,
  validateManualRankings,
} from '../services/rankingService.js';

describe('Ranking Service', () => {
  it('automatically ranks employees by performance score descending', () => {
    const input = [
      { employeeId: 'EMP-01', performanceScore: 850 },
      { employeeId: 'EMP-02', performanceScore: 980 },
      { employeeId: 'EMP-03', performanceScore: 920 },
    ];

    const result = calculateAutoRankings(input);
    expect(result.valid).toBe(true);
    expect(result.rankings).toBeDefined();
    expect(result.rankings![0].employeeId).toBe('EMP-02');
    expect(result.rankings![0].rank).toBe(1);
    expect(result.rankings![1].employeeId).toBe('EMP-03');
    expect(result.rankings![1].rank).toBe(2);
    expect(result.rankings![2].employeeId).toBe('EMP-01');
    expect(result.rankings![2].rank).toBe(3);
  });

  it('rejects duplicate employee IDs within the same leaderboard', () => {
    const input = [
      { employeeId: 'EMP-01', performanceScore: 900 },
      { employeeId: 'EMP-01', performanceScore: 850 },
    ];

    const result = calculateAutoRankings(input);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Duplicate employee detected');
  });

  it('rejects leaderboard submissions exceeding 10 employees', () => {
    const input = Array.from({ length: 11 }, (_, i) => ({
      employeeId: `EMP-${i + 1}`,
      performanceScore: 800 + i * 10,
    }));

    const result = calculateAutoRankings(input);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('cannot exceed 10');
  });

  it('validates manual rankings and detects duplicate rank assignments', () => {
    const input = [
      { employeeId: 'EMP-01', rank: 1, performanceScore: 950 },
      { employeeId: 'EMP-02', rank: 1, performanceScore: 920 },
    ];

    const result = validateManualRankings(input, false);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Duplicate rank #1');
  });

  it('allows manual ties when allowTies is enabled', () => {
    const input = [
      { employeeId: 'EMP-01', performanceScore: 950 },
      { employeeId: 'EMP-02', performanceScore: 950 },
      { employeeId: 'EMP-03', performanceScore: 910 },
    ];

    const result = calculateAutoRankings(input, true);
    expect(result.valid).toBe(true);
    expect(result.rankings![0].rank).toBe(1);
    expect(result.rankings![1].rank).toBe(1);
    expect(result.rankings![2].rank).toBe(3);
  });

  it('rejects out of range performance scores', () => {
    const input = [
      { employeeId: 'EMP-01', performanceScore: 1250 },
    ];

    const result = calculateAutoRankings(input);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('between 0 and 1000');
  });
});

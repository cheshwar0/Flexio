import { apiClient } from './api.js';
import { Team } from '../types/index.js';

export async function fetchTeams(): Promise<Team[]> {
  const response = await apiClient.get<{ success: boolean; count: number; teams: Team[] }>('/teams');
  return response.data.teams;
}

export async function updateTeams(
  teams: {
    slotNumber: number;
    name: string;
    description?: string;
    teamId?: string;
    teamLeaderEmployeeId?: string | null;
    active?: boolean;
  }[]
): Promise<Team[]> {
  const response = await apiClient.put<{ success: boolean; message: string; teams: Team[] }>('/teams', { teams });
  return response.data.teams;
}


import { apiClient } from './api.js';
import { Week, WeeklyRankingItem } from '../types/index.js';

export async function fetchWeeks() {
  const response = await apiClient.get<{ success: boolean; count: number; weeks: Week[] }>('/weeks');
  return response.data.weeks;
}

export async function fetchWeekById(id: string) {
  const response = await apiClient.get<{
    success: boolean;
    week: Week;
    rankings: WeeklyRankingItem[];
  }>(`/weeks/${id}`);
  return response.data;
}

export async function createWeek(data: {
  weekId: string;
  title: string;
  presentedBy?: string;
  weekStartDate: string;
  weekEndDate: string;
}) {
  const response = await apiClient.post<{ success: boolean; week: Week; message: string }>('/weeks', data);
  return response.data;
}

export async function updateWeekRankings(
  id: string,
  data: {
    title?: string;
    presentedBy?: string;
    weekStartDate?: string;
    weekEndDate?: string;
    mode?: 'auto' | 'manual';
    allowTies?: boolean;
    rankings: {
      employeeId: string;
      rank?: number;
      performanceScore: number;
      achievementDescription?: string;
    }[];
  }
) {
  const response = await apiClient.put<{ success: boolean; week: Week; message: string }>(`/weeks/${id}`, data);
  return response.data;
}

export async function publishWeek(id: string) {
  const response = await apiClient.post<{ success: boolean; week: Week; message: string }>(`/weeks/${id}/publish`);
  return response.data;
}

export async function publishNewWeeklyTop10(data: {
  weekId: string;
  title: string;
  presentedBy?: string;
  weekStartDate: string;
  weekEndDate: string;
  mode?: 'auto' | 'manual';
  allowTies?: boolean;
  rankings: {
    employeeId: string;
    rank: number;
    performanceScore: number;
    achievementDescription?: string;
  }[];
}) {
  const response = await apiClient.post<{
    success: boolean;
    week: Week;
    message: string;
    rankingsCount: number;
  }>('/weeks/publish-top10', data);
  return response.data;
}

export async function deleteWeek(id: string) {
  const response = await apiClient.delete<{ success: boolean; message: string }>(`/weeks/${id}`);
  return response.data;
}

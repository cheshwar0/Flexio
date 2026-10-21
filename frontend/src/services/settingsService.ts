import { apiClient } from './api.js';
import { SettingsData } from '../types/index.js';

export async function fetchSettings(): Promise<SettingsData> {
  const response = await apiClient.get<{ success: boolean; settings: SettingsData }>('/settings');
  return response.data.settings;
}

export async function updateSettings(data: Partial<SettingsData>): Promise<SettingsData> {
  const response = await apiClient.put<{ success: boolean; settings: SettingsData; message: string }>('/settings', data);
  return response.data.settings;
}

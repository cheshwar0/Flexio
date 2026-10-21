import { apiClient } from './api.js';
import { DisplayResponse } from '../types/index.js';

export async function fetchCurrentDisplay(): Promise<DisplayResponse> {
  const response = await apiClient.get<DisplayResponse>('/display/current');
  return response.data;
}

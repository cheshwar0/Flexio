import { apiClient } from './api.js';
import { Employee } from '../types/index.js';

export async function fetchEmployees(params?: {
  search?: string;
  team?: string;
  department?: string;
  activeOnly?: boolean;
}) {
  const response = await apiClient.get<{ success: boolean; count: number; employees: Employee[] }>('/employees', {
    params,
  });
  return response.data.employees;
}

export async function createEmployee(data: {
  employeeId?: string;
  fullName: string;
  team: string;
  designation: string;
  department?: string;
  imageUrl?: string;
}) {
  const response = await apiClient.post<{ success: boolean; employee: Employee; message: string }>('/employees', data);
  return response.data;
}

export async function updateEmployee(id: string, data: Partial<Employee>) {
  const response = await apiClient.put<{ success: boolean; employee: Employee; message: string }>(`/employees/${id}`, data);
  return response.data;
}

export async function deleteEmployee(id: string) {
  const response = await apiClient.delete<{ success: boolean; message: string }>(`/employees/${id}`);
  return response.data;
}

export async function toggleEmployeeStatus(id: string) {
  const response = await apiClient.patch<{ success: boolean; employee: Employee; message: string }>(`/employees/${id}/toggle-status`);
  return response.data;
}

export async function uploadEmployeePhoto(id: string, file: File) {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await apiClient.post<{
    success: boolean;
    imageUrl: string;
    cloudinaryPublicId?: string;
    employee: Employee;
    message: string;
  }>(`/employees/${id}/photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function bulkImportEmployees(employees: any[]) {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    importedCount: number;
    skippedCount: number;
    errors: string[];
  }>('/employees/bulk-import', { employees });
  return response.data;
}

export async function downloadCsvTemplate(): Promise<void> {
  const response = await apiClient.get('/employees/template', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'employee_bulk_import_template.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
}

import {
  AdminUser,
  AdminUserInput,
  ApiErrorResponse,
  ClockActionResponse,
  DeleteUserResponse,
  Employee,
  TimesheetResponse,
} from './types';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });

  if (!res.ok) {
    const body: ApiErrorResponse = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(res.status, body.error || 'Request failed');
  }

  return res.json();
}

export function fetchEmployees(): Promise<Employee[]> {
  return request<Employee[]>('/api/users');
}

export function clockIn(userId: string, pin: string): Promise<ClockActionResponse> {
  return request<ClockActionResponse>('/api/shifts/clock-in', {
    method: 'POST',
    body: JSON.stringify({ userId, pin }),
  });
}

export function clockOut(userId: string, pin: string): Promise<ClockActionResponse> {
  return request<ClockActionResponse>('/api/shifts/clock-out', {
    method: 'POST',
    body: JSON.stringify({ userId, pin }),
  });
}

export function toggleBreak(userId: string, pin: string): Promise<ClockActionResponse> {
  return request<ClockActionResponse>('/api/shifts/break', {
    method: 'POST',
    body: JSON.stringify({ userId, pin }),
  });
}

export function adminLogin(pin: string): Promise<{ token: string }> {
  return request<{ token: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  });
}

export function fetchTimesheet(
  start: string,
  end: string,
  token: string,
): Promise<TimesheetResponse> {
  return request<TimesheetResponse>(`/api/admin/timesheet?start=${start}&end=${end}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function fetchAdminUsers(token: string): Promise<AdminUser[]> {
  return request<AdminUser[]>('/api/admin/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createAdminUser(input: AdminUserInput, token: string): Promise<AdminUser> {
  return request<AdminUser>('/api/admin/users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

export function updateAdminUser(
  id: string,
  input: Partial<AdminUserInput> & { isActive?: boolean },
  token: string,
): Promise<AdminUser> {
  return request<AdminUser>(`/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

export function deleteAdminUser(id: string, token: string): Promise<DeleteUserResponse> {
  return request<DeleteUserResponse>(`/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export type EmployeeStatus = 'CLOCKED_OUT' | 'CLOCKED_IN' | 'ON_BREAK';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string | null;
  status: EmployeeStatus;
}

export interface ClockActionResponse {
  status: EmployeeStatus;
}

export interface ApiErrorResponse {
  error: string;
}

export interface LiveShiftInfo {
  clockIn: string;
  onBreak: boolean;
  breakStartedAt: string | null;
  pausedMs: number;
}

export interface TimesheetEmployee {
  id: string;
  firstName: string;
  lastName: string;
  position: string | null;
  status: EmployeeStatus;
  live: LiveShiftInfo | null;
  hours: Record<string, number>;
  breaks: Record<string, number>;
  total: number;
  totalBreak: number;
  breakFlag: boolean;
  hourlyRate: number;
  pay: number;
}

export interface TimesheetResponse {
  days: string[];
  employees: TimesheetEmployee[];
  dailyTotals: Record<string, number>;
  dailyBreakTotals: Record<string, number>;
  grandTotal: number;
  grandBreakTotal: number;
  grandPayTotal: number;
}

export type UserRole = 'EMPLOYEE' | 'ADMIN';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  position: string | null;
  hourlyRate: number;
  role: UserRole;
  isActive: boolean;
}

export interface AdminUserInput {
  firstName: string;
  lastName: string;
  position: string | null;
  hourlyRate: number;
  role: UserRole;
  pin?: string;
}

export interface DeleteUserResponse {
  deleted: boolean;
  deactivated: boolean;
}

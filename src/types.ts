export type ActiveTab = 'dashboard' | 'apply' | 'my-requests' | 'approvals' | 'calendar' | 'ai-assistant' | 'payroll';

export type UserRole = 'employee' | 'manager' | 'hr';

export type LeaveType = 'Annual Leave' | 'Sick Leave' | 'Parental Leave' | 'Unpaid Leave' | 'Compassionate Leave' | 'Study Leave';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  jobTitle?: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  isHalfDay: boolean;
  halfDaySession?: 'Morning' | 'Afternoon';
  reason: string;
  handoverNotes: string;
  coverageColleague: string;
  status: LeaveStatus;
  appliedAt: number;
  managerRemarks?: string;
  approverName?: string;
  workflowStep?: string;
}

export interface LeaveBalance {
  leaveType: LeaveType;
  total: number;
  used: number;
  pending: number;
}

export interface PayrollRecord {
  employeeName: string;
  department: string;
  baseMonthlySalary: number;
  unpaidLeaveDays: number;
  deductionAmount: number;
  netPayable: number;
  syncStatus: 'Synced' | 'Pending Sync' | 'Failed';
}

// AI & Workspace utility types
export type ModelName = 'gemini-4-hydrogen' | 'gemini-4-neon' | 'gemini-4-carbon' | 'gemini-3.1-flash-lite';

export type ThinkingLevelOption = 'LOW' | 'MEDIUM' | 'HIGH' | 'XHIGH';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: string;
}

export interface WorkspaceItem {
  id: string;
  title: string;
  type: 'chat' | 'writer' | 'code' | 'vision' | 'json';
  content: string;
  metadata?: any;
  createdAt: number;
  tags: string[];
  favorite?: boolean;
}

import React, { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ApplyLeave } from './components/ApplyLeave';
import { MyRequests } from './components/MyRequests';
import { TeamApprovals } from './components/TeamApprovals';
import { TeamCalendar } from './components/TeamCalendar';
import { PayrollSync } from './components/PayrollSync';
import { AiHrAssistant } from './components/AiHrAssistant';
import { ActiveTab, UserRole, LeaveRequest, LeaveBalance, ModelName, ThinkingLevelOption } from './types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ identifier: string; name: string } | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('employee');
  const [currentModel, setCurrentModel] = useState<ModelName>('gemini-4-hydrogen');
  const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevelOption>('HIGH');

  const [balances, setBalances] = useState<LeaveBalance[]>([
    { leaveType: 'Annual Leave', total: 20, used: 4, pending: 1 },
    { leaveType: 'Sick Leave', total: 14, used: 1, pending: 0 },
    { leaveType: 'Parental Leave', total: 60, used: 0, pending: 0 },
    { leaveType: 'Compassionate Leave', total: 5, used: 0, pending: 0 },
    { leaveType: 'Study Leave', total: 10, used: 0, pending: 0 },
  ]);

  const [requests, setRequests] = useState<LeaveRequest[]>(() => {
    try {
      const saved = localStorage.getItem('leaveflow_requests');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: '1',
        employeeName: 'Connie Cho',
        employeeEmail: 'connie.cho@company.com',
        department: 'Manufacturing & Stamping',
        jobTitle: 'Production Line Operator',
        directSupervisor: 'CCCho',
        leaveType: 'Annual Leave',
        startDate: '2026-12-01',
        endDate: '2026-12-04',
        totalDays: 4,
        isHalfDay: false,
        reason: 'Family vacation',
        handoverNotes: 'Production line B coverage assigned.',
        coverageColleague: 'Robert Taylor',
        status: 'Pending',
        appliedAt: Date.now(),
        approverName: 'CCCho (Shift Supervisor)',
        workflowStep: 'Tier 2: Plant Operations Manager Sign-off',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('leaveflow_requests', JSON.stringify(requests));
    } catch (err) {
      console.error('Failed to save requests', err);
    }
  }, [requests]);

  const handleAddRequest = (newReq: Omit<LeaveRequest, 'id' | 'appliedAt' | 'status'>) => {
    const request: LeaveRequest = {
      ...newReq,
      id: Date.now().toString(),
      appliedAt: Date.now(),
      status: 'Pending',
    };
    setRequests((prev) => [request, ...prev]);

    // Update pending balance
    setBalances((prev) =>
      prev.map((b) => (b.leaveType === request.leaveType ? { ...b, pending: b.pending + request.totalDays } : b))
    );
  };

  const handleUpdateStatus = (id: string, status: 'Approved' | 'Rejected', remarks: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          if (status === 'Approved') {
            setBalances((bals) =>
              bals.map((b) =>
                b.leaveType === r.leaveType
                  ? { ...b, used: b.used + r.totalDays, pending: Math.max(0, b.pending - r.totalDays) }
                  : b
              )
            );
          } else {
            setBalances((bals) =>
              bals.map((b) =>
                b.leaveType === r.leaveType ? { ...b, pending: Math.max(0, b.pending - r.totalDays) } : b
              )
            );
          }
          return { ...r, status, managerRemarks: remarks, workflowStep: status === 'Approved' ? 'Completed (Approved)' : 'Completed (Rejected)' };
        }
        return r;
      })
    );
  };

  const handleCancelRequest = (id: string) => {
    const req = requests.find((r) => r.id === id);
    if (req && req.status === 'Pending') {
      setBalances((prev) =>
        prev.map((b) => (b.leaveType === req.leaveType ? { ...b, pending: Math.max(0, b.pending - req.totalDays) } : b))
      );
    }
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;

  if (!isAuthenticated) {
    return (
      <AuthPage
        onLoginSuccess={(userData) => {
          setCurrentUser(userData);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      <header className="h-16 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3 max-w-2xl">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-zinc-800">
            <img src="/assets/aistudio/image_c79a9ae7.png" alt="Taichong Logo" className="w-full h-full object-contain rounded-lg" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent tracking-tight leading-tight">
              TAICHONG AUTOMATION / ENGINEERING
            </h1>
            <p className="text-[10px] text-zinc-400 font-medium">
              LeaveFlow Pro • Welcome, <span className="text-emerald-400 font-bold">{currentUser?.name || 'User'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 shrink-0">
          {/* Role Switcher */}
          <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs">
            <span className="text-zinc-500 px-2 font-medium">Role:</span>
            <button
              onClick={() => setUserRole('employee')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                userRole === 'employee' ? 'bg-emerald-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Employee
            </button>
            <button
              onClick={() => setUserRole('manager')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors relative ${
                userRole === 'manager' ? 'bg-emerald-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Manager / HR
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => {
              setIsAuthenticated(false);
              setCurrentUser(null);
            }}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-rose-900/30 text-rose-400 border border-zinc-800 text-xs font-semibold transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={userRole}
          pendingCount={pendingCount}
        />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'dashboard' && (
            <Dashboard
              balances={balances}
              requests={requests}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'apply' && (
            <ApplyLeave
              onAddRequest={handleAddRequest}
              setActiveTab={setActiveTab}
              currentModel={currentModel}
              thinkingLevel={thinkingLevel}
              currentUser={currentUser || undefined}
            />
          )}
          {activeTab === 'my-requests' && (
            <MyRequests
              requests={requests}
              onCancelRequest={handleCancelRequest}
            />
          )}
          {activeTab === 'approvals' && (
            <TeamApprovals
              requests={requests}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
          {activeTab === 'calendar' && (
            <TeamCalendar requests={requests} />
          )}
          {activeTab === 'payroll' && (
            <PayrollSync
              requests={requests}
              currentModel={currentModel}
              thinkingLevel={thinkingLevel}
            />
          )}
          {activeTab === 'ai-assistant' && (
            <AiHrAssistant
              currentModel={currentModel}
              thinkingLevel={thinkingLevel}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav aria-label="Mobile Navigation" className="md:hidden border-t border-zinc-800 bg-zinc-950 px-2 py-2 flex items-center justify-around shrink-0 text-[11px]">
        {[
          { id: 'dashboard', label: 'Home' },
          { id: 'apply', label: 'Apply' },
          { id: 'my-requests', label: 'My Requests' },
          ...(userRole === 'manager' ? [{ id: 'approvals', label: 'Approvals' }] : []),
          { id: 'calendar', label: 'Calendar' },
          { id: 'payroll', label: 'Payroll' },
          { id: 'ai-assistant', label: 'AI HR' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ActiveTab)}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === tab.id ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

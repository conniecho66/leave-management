import React, { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('employee');
  const [currentModel, setCurrentModel] = useState<ModelName>('gemini-4-hydrogen');
  const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevelOption>('HIGH');

  const [balances, setBalances] = useState<LeaveBalance[]>([
    { leaveType: 'Annual Leave', total: 20, used: 6, pending: 2 },
    { leaveType: 'Sick Leave', total: 14, used: 2, pending: 0 },
    { leaveType: 'Parental Leave', total: 60, used: 0, pending: 0 },
    { leaveType: 'Compassionate Leave', total: 5, used: 0, pending: 0 },
    { leaveType: 'Study Leave', total: 10, used: 3, pending: 0 },
  ]);

  const [requests, setRequests] = useState<LeaveRequest[]>(() => {
    try {
      const saved = localStorage.getItem('leaveflow_requests');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: '1',
        employeeName: 'Alex Morgan',
        employeeEmail: 'alex.morgan@company.com',
        department: 'Engineering',
        leaveType: 'Annual Leave',
        startDate: '2026-12-10',
        endDate: '2026-12-15',
        totalDays: 6,
        isHalfDay: false,
        reason: 'Family winter vacation and holiday travel.',
        handoverNotes: 'All sprint tasks completed. Sarah Jenkins covering emergency bug fixes.',
        coverageColleague: 'Sarah Jenkins',
        status: 'Approved',
        appliedAt: Date.now() - 86400000 * 5,
        managerRemarks: 'Approved. Enjoy your vacation!',
      },
      {
        id: '2',
        employeeName: 'Jordan Lee',
        employeeEmail: 'jordan.lee@company.com',
        department: 'Product',
        leaveType: 'Sick Leave',
        startDate: '2026-11-22',
        endDate: '2026-11-23',
        totalDays: 2,
        isHalfDay: false,
        reason: 'Medical procedure and recovery.',
        handoverNotes: 'Product backlog groomed. David taking over sync calls.',
        coverageColleague: 'David Chen',
        status: 'Pending',
        appliedAt: Date.now() - 86400000,
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
          // If approved, update used balance
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
          return { ...r, status, managerRemarks: remarks };
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      <Navbar
        userRole={userRole}
        setUserRole={setUserRole}
        pendingApprovalsCount={pendingCount}
      />

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

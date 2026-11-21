import React from 'react';
import { LayoutDashboard, PlusCircle, FileText, CheckSquare, Calendar, Bot, DollarSign } from 'lucide-react';
import { ActiveTab, UserRole } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userRole: UserRole;
  pendingCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole, pendingCount }) => {
  // Employees only see Apply Leave and My Requests
  const navItems =
    userRole === 'employee'
      ? [
          { id: 'apply', label: 'Apply Leave', icon: PlusCircle, desc: 'Submit new request' },
          { id: 'my-requests', label: 'My Requests', icon: FileText, desc: 'Track leave status' },
        ]
      : [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Overview & balances' },
          { id: 'apply', label: 'Apply Leave', icon: PlusCircle, desc: 'Submit new request' },
          { id: 'my-requests', label: 'My Requests', icon: FileText, desc: 'Track leave status' },
          { id: 'approvals', label: 'Team Approvals', icon: CheckSquare, desc: 'Approve or reject', badge: pendingCount },
          { id: 'calendar', label: 'Team Calendar', icon: Calendar, desc: 'Schedule & timeline' },
          { id: 'payroll', label: 'Payroll Sync', icon: DollarSign, desc: 'Unpaid leave & deductions' },
          { id: 'ai-assistant', label: 'AI HR Assistant', icon: Bot, desc: 'Policy & handover AI' },
        ];

  return (
    <aside className="w-72 border-r border-zinc-800 bg-zinc-950/80 p-4 flex flex-col space-y-2 shrink-0 hidden md:flex">
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Leave Portal
      </div>
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`w-full flex items-start space-x-3 px-3 py-3 rounded-xl transition-all text-left group relative ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600/20 via-teal-600/10 to-transparent border border-emerald-500/30 text-white shadow-lg'
                  : 'hover:bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <div
                className={`p-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                    : 'bg-zinc-900 text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold leading-tight flex items-center justify-between ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-zinc-500 truncate mt-0.5 font-normal">
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-3.5 rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 text-xs">
        <div className="font-semibold text-zinc-300 mb-1 flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Role: {userRole}</span>
        </div>
        <p className="text-zinc-400 text-[11px] leading-relaxed">
          {userRole === 'employee' ? 'Employee leave application mode active.' : 'Manager / Admin approval portal active.'}
        </p>
      </div>
    </aside>
  );
};

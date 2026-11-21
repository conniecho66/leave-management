import React from 'react';
import { CalendarCheck, Shield, UserCheck, Bell, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  pendingApprovalsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ userRole, setUserRole, pendingApprovalsCount }) => {
  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <CalendarCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent tracking-tight">
            LeaveFlow Pro
          </h1>
          <p className="text-xs text-zinc-400 font-medium">Enterprise Leave Management System</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
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
            {pendingApprovalsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {pendingApprovalsCount}
              </span>
            )}
          </button>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini AI HR Active</span>
        </div>
      </div>
    </header>
  );
};

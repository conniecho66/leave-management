import React from 'react';
import { LayoutDashboard, Calendar, Clock, CheckCircle2, AlertCircle, PlusCircle, ArrowUpRight } from 'lucide-react';
import { LeaveBalance, LeaveRequest, ActiveTab } from '../types';

interface DashboardProps {
  balances: LeaveBalance[];
  requests: LeaveRequest[];
  setActiveTab: (tab: ActiveTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ balances, requests, setActiveTab }) => {
  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const approvedCount = requests.filter((r) => r.status === 'Approved').length;
  const totalUsedDays = requests
    .filter((r) => r.status === 'Approved')
    .reduce((acc, curr) => acc + curr.totalDays, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Employee Leave Dashboard</h2>
            <p className="text-xs text-zinc-400">Overview of your leave quotas, recent requests, and team schedule</p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('apply')}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{approvedCount}</div>
            <div className="text-xs text-zinc-400 font-medium">Approved Requests</div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{pendingCount}</div>
            <div className="text-xs text-zinc-400 font-medium">Pending Approvals</div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalUsedDays} Days</div>
            <div className="text-xs text-zinc-400 font-medium">Total Leave Taken</div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">2026</div>
            <div className="text-xs text-zinc-400 font-medium">Active Leave Cycle</div>
          </div>
        </div>
      </div>

      {/* Leave Balances Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-200">Leave Balances & Quotas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {balances.map((b) => {
            const remaining = b.total - b.used;
            const percentage = Math.round((b.used / b.total) * 100);
            return (
              <div key={b.leaveType} className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{b.leaveType}</span>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {remaining} Days Left
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-400 font-medium">
                    <span>Used: {b.used} days</span>
                    <span>Total: {b.total} days</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Requests Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-200">Recent Leave Applications</h3>
          <button
            onClick={() => setActiveTab('my-requests')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
          {requests.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">No leave requests found. Click "Apply for Leave" to start.</div>
          ) : (
            <div className="divide-y divide-zinc-800/80">
              {requests.slice(0, 4).map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between hover:bg-zinc-900/90 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold text-white">{r.leaveType}</span>
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                          r.status === 'Approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : r.status === 'Pending'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400">
                      {r.startDate} to {r.endDate} ({r.totalDays} {r.totalDays === 1 ? 'day' : 'days'})
                    </div>
                  </div>
                  <div className="text-right text-xs text-zinc-500">
                    Applied {new Date(r.appliedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

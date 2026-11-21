import React, { useState } from 'react';
import { CheckSquare, Check, X, User, Calendar, MessageSquare, ShieldCheck } from 'lucide-react';
import { LeaveRequest } from '../types';

interface TeamApprovalsProps {
  requests: LeaveRequest[];
  onUpdateStatus: (id: string, status: 'Approved' | 'Rejected', remarks: string) => void;
}

export const TeamApprovals: React.FC<TeamApprovalsProps> = ({ requests, onUpdateStatus }) => {
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const pendingRequests = requests.filter((r) => r.status === 'Pending');

  const handleAction = (id: string, status: 'Approved' | 'Rejected') => {
    const remark = remarks[id] || (status === 'Approved' ? 'Approved by PIC.' : 'Rejected by PIC.');
    onUpdateStatus(id, status, remark);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">PIC & Manager Leave Approvals</h2>
            <p className="text-xs text-zinc-400">Review pending team leave applications and manage coverage</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>{pendingRequests.length} Pending Approval Requests</span>
        </div>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-zinc-600 space-y-3 min-h-[300px]">
          <CheckSquare className="w-12 h-12 stroke-1" />
          <p className="text-sm">All caught up! There are no pending leave applications awaiting your approval.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingRequests.map((r) => (
            <div
              key={r.id}
              className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                      {r.employeeName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{r.employeeName}</h3>
                      <p className="text-xs text-zinc-400">{r.department} • {r.employeeEmail}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    {r.leaveType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                  <div>
                    <span className="text-zinc-500 block mb-0.5">Dates</span>
                    <span className="font-semibold text-white">{r.startDate} to {r.endDate}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-0.5">Duration</span>
                    <span className="font-semibold text-emerald-400">{r.totalDays} {r.totalDays === 1 ? 'Day' : 'Days'}</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-zinc-800/80">
                    <span className="text-zinc-500 block mb-0.5">Coverage Colleague</span>
                    <span className="font-semibold text-zinc-200">{r.coverageColleague}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-zinc-400 block mb-1">Reason:</span>
                  <p className="text-xs text-zinc-200 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    "{r.reason}"
                  </p>
                </div>

                {r.handoverNotes && (
                  <div>
                    <span className="text-xs text-zinc-400 block mb-1">Handover Notes:</span>
                    <div className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800 font-mono text-[11px] whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {r.handoverNotes}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">PIC Remarks / Comments</label>
                  <input
                    type="text"
                    value={remarks[r.id] || ''}
                    onChange={(e) => setRemarks({ ...remarks, [r.id]: e.target.value })}
                    placeholder="Add approval remarks or reason for rejection..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-zinc-800">
                <button
                  onClick={() => handleAction(r.id, 'Approved')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center space-x-2 text-xs shadow-lg shadow-emerald-600/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Leave</span>
                </button>
                <button
                  onClick={() => handleAction(r.id, 'Rejected')}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center space-x-2 text-xs shadow-lg shadow-rose-600/20"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

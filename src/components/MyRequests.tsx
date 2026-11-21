import React, { useState } from 'react';
import { FileText, Calendar, Clock, CheckCircle2, XCircle, Trash2, Eye } from 'lucide-react';
import { LeaveRequest } from '../types';

interface MyRequestsProps {
  requests: LeaveRequest[];
  onCancelRequest: (id: string) => void;
}

export const MyRequests: React.FC<MyRequestsProps> = ({ requests, onCancelRequest }) => {
  const [filter, setFilter] = useState<string>('All');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  const filteredRequests = requests.filter((r) => {
    if (filter === 'All') return true;
    return r.status === filter;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">My Leave Requests</h2>
            <p className="text-xs text-zinc-400">Track status of your submitted leave applications and PIC approvals</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs">
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === status ? 'bg-teal-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-zinc-600 space-y-3 min-h-[300px]">
          <Calendar className="w-12 h-12 stroke-1" />
          <p className="text-sm">No leave requests found matching status "{filter}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((r) => (
            <div
              key={r.id}
              className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm hover:border-zinc-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{r.leaveType}</span>
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                      r.status === 'Approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : r.status === 'Pending'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-300">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Dates:</span>
                    <span className="font-medium text-white">{r.startDate} to {r.endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Duration:</span>
                    <span className="font-semibold text-emerald-400">{r.totalDays} {r.totalDays === 1 ? 'Day' : 'Days'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Coverage:</span>
                    <span className="font-medium text-zinc-200">{r.coverageColleague}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 line-clamp-2">
                  "{r.reason}"
                </p>

                {r.managerRemarks && (
                  <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                    <span className="font-bold">PIC Remarks:</span> {r.managerRemarks}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs">
                <span className="text-zinc-500">
                  Applied {new Date(r.appliedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedRequest(r)}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {r.status === 'Pending' && (
                    <button
                      onClick={() => onCancelRequest(r.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 transition-colors"
                      title="Cancel Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">Leave Application Details</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-zinc-400 hover:text-white text-xs bg-zinc-800 px-2.5 py-1 rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">Leave Type:</span>
                <span className="font-bold text-white">{selectedRequest.leaveType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Status:</span>
                <span className="font-bold text-emerald-400">{selectedRequest.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Duration:</span>
                <span className="font-semibold text-white">{selectedRequest.startDate} to {selectedRequest.endDate} ({selectedRequest.totalDays} days)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Coverage Colleague:</span>
                <span className="font-semibold text-white">{selectedRequest.coverageColleague}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-1">Reason:</span>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-zinc-200">{selectedRequest.reason}</div>
              </div>
              {selectedRequest.handoverNotes && (
                <div>
                  <span className="text-zinc-500 block mb-1">Handover Notes:</span>
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-zinc-200 font-mono text-[11px] whitespace-pre-wrap">
                    {selectedRequest.handoverNotes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { PlusCircle, Sparkles, Calendar, User, FileText, Send, Loader2, UserCheck } from 'lucide-react';
import { LeaveType, LeaveRequest, ActiveTab, ModelName, ThinkingLevelOption, DIRECT_SUPERVISORS } from '../types';

interface ApplyLeaveProps {
  onAddRequest: (request: Omit<LeaveRequest, 'id' | 'appliedAt' | 'status'>) => void;
  setActiveTab: (tab: ActiveTab) => void;
  currentModel: ModelName;
  thinkingLevel: ThinkingLevelOption;
}

export const ApplyLeave: React.FC<ApplyLeaveProps> = ({ onAddRequest, setActiveTab, currentModel, thinkingLevel }) => {
  const [employeeName, setEmployeeName] = useState('Connie Cho');
  const [employeeEmail, setEmployeeEmail] = useState('connie.cho@company.com');
  const [department, setDepartment] = useState('Manufacturing & Stamping');
  const [jobTitle, setJobTitle] = useState('Production Line Operator');
  const [directSupervisor, setDirectSupervisor] = useState(DIRECT_SUPERVISORS[2].value); // CCCho default
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual Leave');
  const [startDate, setStartDate] = useState('2026-12-01');
  const [endDate, setEndDate] = useState('2026-12-04');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<'Morning' | 'Afternoon'>('Morning');
  const [reason, setReason] = useState('Family trip');
  const [handoverNotes, setHandoverNotes] = useState('Production line B coverage assigned during absence.');
  const [coverageColleague, setCoverageColleague] = useState('Robert Taylor');
  const [workflowStep, setWorkflowStep] = useState('Level 1: Line Supervisor Review');

  const [aiLoading, setAiLoading] = useState(false);

  const totalDays = 4; // 4 days for Connie's request

  const handleGenerateAiHandover = async () => {
    setAiLoading(true);
    try {
      const prompt = `Generate a professional leave handover plan and coverage checklist for a colleague (${coverageColleague}) during my ${totalDays}-day absence due to ${leaveType} (${reason}).`;
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model: currentModel,
          systemInstruction: 'You are an HR and operational assistant helping employees write clear handover notes.',
          thinkingLevel,
        }),
      });

      const data = await res.json();
      if (data.text) {
        setHandoverNotes(data.text);
      }
    } catch (err: any) {
      alert('Failed to generate AI handover plan: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName || !startDate || !endDate || !reason) {
      alert('Please fill out all required fields.');
      return;
    }

    onAddRequest({
      employeeName,
      employeeEmail,
      department,
      jobTitle,
      directSupervisor,
      leaveType,
      startDate,
      endDate,
      totalDays,
      isHalfDay,
      halfDaySession: isHalfDay ? halfDaySession : undefined,
      reason,
      handoverNotes,
      coverageColleague,
      approverName: `${directSupervisor} (Shift Supervisor)`,
      workflowStep: totalDays > 3 ? 'Extended Leave (Multi-Tier Approval)' : workflowStep,
    });

    alert('Leave application submitted successfully and assigned to supervisor for approval!');
    setActiveTab('my-requests');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-zinc-800">
        <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
          <PlusCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Apply for Leave</h2>
          <p className="text-xs text-zinc-400">Submit your leave application and select your authorized direct supervisor</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Fields */}
        <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Employee Name</label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={employeeEmail}
                onChange={(e) => setEmployeeEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Direct Supervisor (Tier 1)</label>
              <select
                value={directSupervisor}
                onChange={(e) => setDirectSupervisor(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-emerald-400 font-semibold focus:outline-none focus:border-emerald-500"
              >
                {DIRECT_SUPERVISORS.map((sup) => (
                  <option key={sup.value} value={sup.value} className="bg-zinc-900 text-zinc-200">
                    {sup.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Leave Type</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Annual Leave">Annual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Parental Leave">Parental Leave</option>
                <option value="Unpaid Leave">Unpaid Leave</option>
                <option value="Compassionate Leave">Compassionate Leave</option>
                <option value="Study Leave">Study Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Total Working Days</label>
              <input
                type="number"
                value={totalDays}
                readOnly
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-emerald-400 font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Reason for Leave</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Provide brief details for your leave request..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Coverage Colleague</label>
              <input
                type="text"
                value={coverageColleague}
                onChange={(e) => setCoverageColleague(e.target.value)}
                placeholder="Colleague covering your tasks"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-300">Handover Notes</label>
              <button
                type="button"
                onClick={handleGenerateAiHandover}
                disabled={aiLoading}
                className="flex items-center space-x-1.5 text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg transition-colors font-medium"
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>AI Handover Plan</span>
              </button>
            </div>
            <textarea
              value={handoverNotes}
              onChange={(e) => setHandoverNotes(e.target.value)}
              rows={4}
              placeholder="Outline pending tasks and urgent items for your coverage colleague..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono text-xs"
            />
          </div>
        </div>

        {/* Summary & Submission Sidebar */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between space-y-6 h-fit">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-3">Application Summary</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Employee:</span>
                <span className="font-semibold text-white">{employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Dept & Title:</span>
                <span className="font-semibold text-white">{department} • {jobTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Direct Supervisor:</span>
                <span className="font-semibold text-emerald-400">{directSupervisor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Type:</span>
                <span className="font-semibold text-white">{leaveType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Days:</span>
                <span className="font-semibold text-emerald-400">{totalDays} Days</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-800">
                <span className="text-zinc-400">Workflow Tier:</span>
                <span className="font-semibold text-amber-400">Multi-Tier (3 Tiers)</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20"
          >
            <Send className="w-4 h-4" />
            <span>Submit & Route to Supervisor</span>
          </button>
        </div>
      </form>
    </div>
  );
};

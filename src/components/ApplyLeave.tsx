import React, { useState } from 'react';
import { PlusCircle, Sparkles, Calendar, User, FileText, Send, Loader2, UserCheck, Upload, CheckCircle2, AlertTriangle } from 'lucide-react';
import { LeaveType, LeaveRequest, ActiveTab, ModelName, ThinkingLevelOption, DIRECT_SUPERVISORS } from '../types';

interface ApplyLeaveProps {
  onAddRequest: (request: Omit<LeaveRequest, 'id' | 'appliedAt' | 'status'>) => void;
  setActiveTab: (tab: ActiveTab) => void;
  currentModel: ModelName;
  thinkingLevel: ThinkingLevelOption;
  currentUser?: { identifier: string; name: string };
}

export const ApplyLeave: React.FC<ApplyLeaveProps> = ({ onAddRequest, setActiveTab, currentModel, thinkingLevel, currentUser }) => {
  const [employeeName, setEmployeeName] = useState(currentUser?.name || '');
  const [employeeEmail, setEmployeeEmail] = useState(currentUser?.identifier.includes('@') ? currentUser.identifier : 'employee@company.com');
  const [department, setDepartment] = useState('Manufacturing & Stamping');
  const [jobTitle, setJobTitle] = useState('Production Line Operator');
  const [directSupervisor, setDirectSupervisor] = useState(DIRECT_SUPERVISORS[0].value);
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual Leave');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<'Morning' | 'Afternoon'>('Morning');
  const [reason, setReason] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [coverageColleague, setCoverageColleague] = useState('');

  const [aiLoading, setAiLoading] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Dynamic working days calculation
  const calculateDays = () => {
    if (isHalfDay) return 0.5;
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) || diffDays < 1 ? 1 : diffDays;
  };
  const totalDays = calculateDays();

  // Dynamic workflow step
  const workflowStep = totalDays > 3 ? 'Tier 2: Plant Operations Manager Sign-off (Multi-Tier)' : 'Tier 1: Line Supervisor Review (Single-Tier)';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocLoading(true);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onerror = () => {
      alert('Failed to read file.');
      setDocLoading(false);
    };
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch('/api/ai/analyze-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data,
            mimeType: file.type || 'application/octet-stream',
            fileName: file.name,
          }),
        });

        const data = await res.json();
        if (data.analysis) {
          setAnalysisResult(data.analysis);
        } else {
          alert('Document analysis returned no structured data.');
        }
      } catch (err: any) {
        alert('Failed to analyze document: ' + err.message);
      } finally {
        setDocLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAutoFill = () => {
    if (!analysisResult) return;
    if (analysisResult.startDate) setStartDate(analysisResult.startDate);
    if (analysisResult.endDate) setEndDate(analysisResult.endDate);
    if (analysisResult.reasonOrDiagnosis) {
      setReason(analysisResult.reasonOrDiagnosis);
    }
    const docTypeLower = (analysisResult.documentType || '').toLowerCase();
    const diagnosisLower = (analysisResult.reasonOrDiagnosis || '').toLowerCase();
    if (docTypeLower.includes('mc') || docTypeLower.includes('medical') || docTypeLower.includes('sick') || diagnosisLower.includes('fever') || diagnosisLower.includes('rest') || diagnosisLower.includes('illness')) {
      setLeaveType('Sick Leave');
    }
    alert('Form successfully auto-filled from document analysis!');
  };

  const handleGenerateAiHandover = async () => {
    if (!reason.trim()) {
      alert('Please enter a leave reason first so Gemini can generate a smart handover plan.');
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `Generate a professional leave handover plan and coverage checklist for a colleague (${coverageColleague || 'Coverage Colleague'}) during my ${totalDays}-day absence due to ${leaveType} (${reason}).`;
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
    if (!employeeName.trim() || !startDate || !endDate || !reason.trim()) {
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
      workflowStep,
    });

    alert('Leave application submitted successfully and routed to supervisor for approval!');
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
          <p className="text-xs text-zinc-400">Submit your leave application with multimodal AI document auditing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Fields */}
        <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl space-y-5">
          {/* Multimodal File Upload / Dropzone */}
          <div className="p-4 bg-zinc-950 border border-dashed border-zinc-700 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-300">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Multimodal Document Analyzer (MC / Tickets / Notes)</span>
              </div>
              {docLoading && (
                <div className="flex items-center space-x-1.5 text-xs text-emerald-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing document with Gemini...</span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
              onChange={handleFileUpload}
              className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
            />

            {/* Analysis Summary Card */}
            {analysisResult && (
              <div className="mt-4 p-4 rounded-xl bg-zinc-900 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center space-x-2">
                    {analysisResult.isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="text-xs font-bold text-white">
                      AI Audit Result: {analysisResult.documentType || 'Document'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-colors"
                  >
                    Auto-fill Form / 自动填表
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
                  <div><span className="text-zinc-500">Issuer / Clinic:</span> {analysisResult.issuerOrClinic || 'N/A'}</div>
                  <div><span className="text-zinc-500">Validity:</span> <span className={analysisResult.isValid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{analysisResult.isValid ? 'Valid / 有效' : 'Review Required'}</span></div>
                  <div><span className="text-zinc-500">Extracted Dates:</span> {analysisResult.startDate || 'N/A'} to {analysisResult.endDate || 'N/A'}</div>
                  <div><span className="text-zinc-500">Total Days:</span> {analysisResult.totalDays || totalDays}</div>
                </div>

                {analysisResult.reasonOrDiagnosis && (
                  <div className="text-xs text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 font-semibold block mb-0.5">Diagnosis / Reason:</span>
                    {analysisResult.reasonOrDiagnosis}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Employee Name</label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Enter full name"
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
                placeholder="employee@company.com"
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
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-emerald-400 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
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
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Calculated Working Days</label>
              <input
                type="text"
                value={`${totalDays} ${totalDays === 1 ? 'Day' : 'Days'}`}
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

          <div className="flex items-center space-x-4 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isHalfDay}
                onChange={(e) => setIsHalfDay(e.target.checked)}
                className="rounded bg-zinc-900 border-zinc-700 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span className="text-sm font-medium text-zinc-200">Request Half-Day (0.5 Day)</span>
            </label>
            {isHalfDay && (
              <select
                value={halfDaySession}
                onChange={(e) => setHalfDaySession(e.target.value as 'Morning' | 'Afternoon')}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200"
              >
                <option value="Morning">Morning Session</option>
                <option value="Afternoon">Afternoon Session</option>
              </select>
            )}
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
                <span className="font-semibold text-white">{employeeName || '(Not provided)'}</span>
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
                <span className="text-zinc-400">Total Working Days:</span>
                <span className="font-semibold text-emerald-400">{totalDays} Days</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-800">
                <span className="text-zinc-400">Workflow Routing:</span>
                <span className="font-semibold text-amber-400 text-right">{workflowStep}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20"
          >
            <Send className="w-4 h-4" />
            <span>Submit Leave Application</span>
          </button>
        </div>
      </form>
    </div>
  );
};

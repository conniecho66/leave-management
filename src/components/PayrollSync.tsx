import React, { useState } from 'react';
import { DollarSign, Download, RefreshCw, CheckCircle2, AlertCircle, Sparkles, Send } from 'lucide-react';
import { LeaveRequest, PayrollRecord, ModelName, ThinkingLevelOption } from '../types';

interface PayrollSyncProps {
  requests: LeaveRequest[];
  currentModel: ModelName;
  thinkingLevel: ThinkingLevelOption;
}

export const PayrollSync: React.FC<PayrollSyncProps> = ({ requests, currentModel, thinkingLevel }) => {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [aiAudit, setAiAudit] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);

  // Derive payroll records dynamically from approved Unpaid Leave requests
  const approvedUnpaidLeaves = requests.filter(
    (r) => r.leaveType === 'Unpaid Leave' && r.status === 'Approved'
  );

  // Group by employeeName
  const employeeMap: { [name: string]: { department: string; unpaidDays: number } } = {};
  approvedUnpaidLeaves.forEach((r) => {
    if (!employeeMap[r.employeeName]) {
      employeeMap[r.employeeName] = { department: r.department, unpaidDays: 0 };
    }
    employeeMap[r.employeeName].unpaidDays += r.totalDays;
  });

  const payrollRecords: PayrollRecord[] = Object.entries(employeeMap).map(([name, info]) => {
    const baseSalary = 5000; // Standard base salary for simulation
    const dailyRate = baseSalary / 22;
    const deduction = Math.round(info.unpaidDays * dailyRate * 100) / 100;
    const net = Math.round((baseSalary - deduction) * 100) / 100;

    return {
      employeeName: name,
      department: info.department,
      baseMonthlySalary: baseSalary,
      unpaidLeaveDays: info.unpaidDays,
      deductionAmount: deduction,
      netPayable: net,
      syncStatus: synced ? 'Synced' : 'Pending Sync',
    };
  });

  const handleSyncToPayroll = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSynced(true);
      alert('Payroll successfully synced with approved unpaid leave records!');
    }, 1200);
  };

  const handleRunAiAudit = async () => {
    if (payrollRecords.length === 0) {
      alert('No unpaid leave records to audit.');
      return;
    }

    setAuditLoading(true);
    setAiAudit('');

    try {
      const summary = payrollRecords
        .map((p) => `${p.employeeName}: Base $${p.baseMonthlySalary}, Unpaid Days: ${p.unpaidLeaveDays}, Deduction: $${p.deductionAmount}`)
        .join('\n');

      const prompt = `Review the following dynamic payroll and leave deduction summary for compliance and reconciliation:\n\n${summary}`;
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model: currentModel,
          systemInstruction: 'You are an expert payroll auditor and HR financial compliance officer.',
          thinkingLevel,
        }),
      });

      const data = await res.json();
      if (data.text) {
        setAiAudit(data.text);
      }
    } catch (err: any) {
      setAiAudit(`Error running AI audit: ${err.message}`);
    } finally {
      setAuditLoading(false);
    }
  };

  const exportPayrollCsv = () => {
    if (payrollRecords.length === 0) {
      alert('No payroll deduction records to export.');
      return;
    }
    const headers = 'Employee,Department,Base Salary,Unpaid Days,Deduction,Net Payable,Status\n';
    const rows = payrollRecords
      .map((p) => `"${p.employeeName}","${p.department}",${p.baseMonthlySalary},${p.unpaidLeaveDays},${p.deductionAmount},${p.netPayable},"${p.syncStatus}"`)
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_leave_sync_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-zinc-800 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Payroll & Leave System Integration</h2>
            <p className="text-xs text-zinc-400">Sync approved unpaid leaves, calculate salary deductions, and export payroll files</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportPayrollCsv}
            disabled={payrollRecords.length === 0}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 border border-zinc-800 text-xs text-zinc-200 font-medium transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Payroll CSV</span>
          </button>
          <button
            onClick={handleSyncToPayroll}
            disabled={syncing || payrollRecords.length === 0}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs text-white font-semibold shadow-lg shadow-emerald-600/20 transition-colors"
          >
            {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{synced ? 'Synced to Payroll' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* Payroll Records Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-sm font-bold text-white">Current Pay Cycle Deductions</span>
          <span className="text-xs text-zinc-400">Based on 22 working days / month</span>
        </div>

        <div className="overflow-x-auto">
          {payrollRecords.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-xs">
              No unpaid leave deductions recorded for this cycle.
            </div>
          ) : (
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800 text-[11px]">
                <tr>
                  <th className="p-4">Employee</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Base Salary</th>
                  <th className="p-4">Unpaid Leave</th>
                  <th className="p-4">Leave Deduction</th>
                  <th className="p-4">Net Payable</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {payrollRecords.map((p, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-4 font-bold text-white">{p.employeeName}</td>
                    <td className="p-4 text-zinc-400">{p.department}</td>
                    <td className="p-4 text-zinc-300">${p.baseMonthlySalary.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded font-medium bg-amber-500/20 text-amber-300">
                        {p.unpaidLeaveDays} days
                      </span>
                    </td>
                    <td className="p-4 text-rose-400 font-medium">-${p.deductionAmount.toLocaleString()}</td>
                    <td className="p-4 font-bold text-emerald-400">${p.netPayable.toLocaleString()}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                          p.syncStatus === 'Synced'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {p.syncStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* AI Payroll Audit & Compliance */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Gemini AI Payroll & Leave Compliance Audit</h3>
          </div>
          <button
            onClick={handleRunAiAudit}
            disabled={auditLoading || payrollRecords.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {auditLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Run AI Audit</span>
          </button>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed min-h-[140px]">
          {auditLoading ? (
            <div className="h-full flex items-center justify-center text-zinc-500 space-x-2 font-sans">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Analyzing payroll deductions and leave compliance...</span>
            </div>
          ) : aiAudit ? (
            aiAudit
          ) : (
            <span className="text-zinc-600 font-sans">Click "Run AI Audit" to verify payroll calculations and leave deduction consistency.</span>
          )}
        </div>
      </div>
    </div>
  );
};

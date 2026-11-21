import React, { useState } from 'react';
import { Calendar as CalendarIcon, Users, ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { LeaveRequest } from '../types';

interface TeamCalendarProps {
  requests: LeaveRequest[];
}

export const TeamCalendar: React.FC<TeamCalendarProps> = ({ requests }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Helper to get start of week (Monday)
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const [weekStart, setWeekStart] = useState<Date>(getStartOfWeek(new Date()));

  const handlePrevWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
  };

  const handleToday = () => {
    setWeekStart(getStartOfWeek(new Date()));
  };

  // Generate 7 days of the week starting from weekStart
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    return day;
  });

  const approvedRequests = requests.filter((r) => r.status === 'Approved' || r.status === 'Pending');

  // Check if a request covers a specific date
  const getRequestsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return approvedRequests.filter((r) => {
      return dateStr >= r.startDate && dateStr <= r.endDate;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-zinc-800 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Weekly Team Leave Calendar</h2>
            <p className="text-xs text-zinc-400">Visual weekly schedule of team absences and coverage</p>
          </div>
        </div>

        {/* Week Navigation Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 font-medium transition-colors"
          >
            This Week
          </button>
          <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={handlePrevWeek}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-zinc-200 px-3">
              {weekDays[0].toLocaleDateString([], { month: 'short', day: 'numeric' })} – {weekDays[6].toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button
              onClick={handleNextWeek}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 flex-1">
        {weekDays.map((day, idx) => {
          const dayRequests = getRequestsForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div
              key={idx}
              className={`bg-zinc-900/60 border rounded-2xl p-4 flex flex-col space-y-3 transition-all ${
                isToday ? 'border-cyan-500/50 bg-cyan-950/10 shadow-lg shadow-cyan-950/30' : 'border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  {day.toLocaleDateString([], { weekday: 'short' })}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isToday ? 'bg-cyan-500 text-white' : 'bg-zinc-800 text-zinc-300'}`}>
                  {day.getDate()}
                </span>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto">
                {dayRequests.length === 0 ? (
                  <div className="text-[11px] text-zinc-600 text-center py-6 font-medium">No leaves scheduled</div>
                ) : (
                  dayRequests.map((r) => (
                    <div
                      key={r.id}
                      className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                        r.status === 'Approved'
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                          : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="truncate">{r.employeeName}</span>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300">
                          {r.leaveType.split(' ')[0]}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">
                        Coverage: {r.coverageColleague}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiError, fetchTimesheet } from '../api';
import { LiveShiftInfo, TimesheetResponse } from '../types';
import {
  TimesheetView,
  formatDayLabel,
  formatRangeLabel,
  getRange,
  shiftRef,
} from '../lib/dateRanges';

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
}

const VIEWS: { value: TimesheetView; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

function formatHours(hours: number): string {
  return hours === 0 ? '–' : hours.toFixed(2);
}

function formatPay(pay: number): string {
  return `£${pay.toFixed(2)}`;
}

function calculateLiveMs(live: LiveShiftInfo, nowMs: number): number {
  const clockInMs = new Date(live.clockIn).getTime();
  let pausedMs = live.pausedMs;
  if (live.onBreak && live.breakStartedAt) {
    pausedMs += nowMs - new Date(live.breakStartedAt).getTime();
  }
  return Math.max(0, nowMs - clockInMs - pausedMs);
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function csvEscape(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function buildCsv(data: TimesheetResponse, singleDay: boolean): string {
  const rows: (string | number)[][] = [];

  if (singleDay) {
    const day = data.days[0];
    rows.push(['Employee', 'Position', 'Status', 'Hours', 'Pay']);
    for (const employee of data.employees) {
      rows.push([
        `${employee.firstName} ${employee.lastName}`,
        employee.position ?? '',
        employee.status,
        employee.hours[day],
        employee.pay,
      ]);
    }
    rows.push(['Total', '', '', data.dailyTotals[day], data.grandPayTotal]);
  } else {
    rows.push(['Employee', 'Position', ...data.days.map(formatDayLabel), 'Total', 'Pay']);
    for (const employee of data.employees) {
      rows.push([
        `${employee.firstName} ${employee.lastName}`,
        employee.position ?? '',
        ...data.days.map((day) => employee.hours[day]),
        employee.total,
        employee.pay,
      ]);
    }
    rows.push([
      'Total',
      '',
      ...data.days.map((day) => data.dailyTotals[day]),
      data.grandTotal,
      data.grandPayTotal,
    ]);
  }

  return rows.map((row) => row.map(csvEscape).join(',')).join('\n');
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  const [view, setView] = useState<TimesheetView>('day');
  const [refDate, setRefDate] = useState(() => new Date());

  const { start, end } = getRange(view, refDate);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['timesheet', start, end],
    queryFn: () => fetchTimesheet(start, end, token),
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        onLogout();
      }
    },
  });

  const singleDay = data ? data.days.length === 1 : false;

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (view !== 'day') return undefined;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [view]);

  const handleExport = () => {
    if (!data) return;
    const csv = buildCsv(data, singleDay);
    const filename = start === end ? `timesheet_${start}.csv` : `timesheet_${start}_to_${end}.csv`;
    downloadCsv(filename, csv);
  };

  return (
    <>
      <div className="admin-dashboard__controls">
        <div className="admin-dashboard__view-toggle">
          {VIEWS.map((v) => (
            <button
              key={v.value}
              type="button"
              className={`admin-dashboard__view-btn ${
                view === v.value ? 'admin-dashboard__view-btn--active' : ''
              }`}
              onClick={() => setView(v.value)}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="admin-dashboard__date-nav">
          <button
            type="button"
            className="admin-dashboard__nav-btn"
            onClick={() => setRefDate((prev) => shiftRef(view, prev, -1))}
            aria-label="Previous"
          >
            ‹
          </button>
          <span className="admin-dashboard__range-label">{formatRangeLabel(view, start, end)}</span>
          <button
            type="button"
            className="admin-dashboard__nav-btn"
            onClick={() => setRefDate((prev) => shiftRef(view, prev, 1))}
            aria-label="Next"
          >
            ›
          </button>
          <button type="button" className="btn btn--dark" onClick={() => setRefDate(new Date())}>
            Today
          </button>
          <button type="button" className="btn btn--gold" onClick={handleExport} disabled={!data}>
            Export CSV
          </button>
        </div>
      </div>

      {isLoading && <p className="status-message">Loading timesheet…</p>}
      {isError && <p className="status-message status-message--error">Could not load timesheet.</p>}

      {data && (
        <div className="timesheet-table-wrapper">
          <table className="timesheet-table">
            <thead>
              <tr>
                <th>Employee</th>
                {singleDay ? (
                  <th>Hours</th>
                ) : (
                  <>
                    {data.days.map((day) => (
                      <th key={day}>{formatDayLabel(day)}</th>
                    ))}
                    <th>Total</th>
                  </>
                )}
                <th>Pay</th>
              </tr>
            </thead>
            <tbody>
              {data.employees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div className="timesheet-table__name">
                      {employee.firstName} {employee.lastName}
                    </div>
                    {employee.position && (
                      <div className="timesheet-table__position">{employee.position}</div>
                    )}
                  </td>
                  {singleDay ? (
                    <td>
                      {employee.live ? (
                        <span
                          className={`timesheet-live ${
                            employee.status === 'ON_BREAK'
                              ? 'timesheet-live--break'
                              : 'timesheet-live--in'
                          }`}
                        >
                          <span className="timesheet-live__dot" />
                          {formatDuration(calculateLiveMs(employee.live, now))}
                        </span>
                      ) : (
                        formatHours(employee.hours[data.days[0]])
                      )}
                    </td>
                  ) : (
                    <>
                      {data.days.map((day) => (
                        <td key={day}>{formatHours(employee.hours[day])}</td>
                      ))}
                      <td className="timesheet-table__total">{formatHours(employee.total)}</td>
                    </>
                  )}
                  <td className="timesheet-table__total">{formatPay(employee.pay)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                {singleDay ? (
                  <td>{formatHours(data.dailyTotals[data.days[0]])}</td>
                ) : (
                  <>
                    {data.days.map((day) => (
                      <td key={day}>{formatHours(data.dailyTotals[day])}</td>
                    ))}
                    <td className="timesheet-table__total">{formatHours(data.grandTotal)}</td>
                  </>
                )}
                <td className="timesheet-table__total">{formatPay(data.grandPayTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </>
  );
}

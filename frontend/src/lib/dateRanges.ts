export type TimesheetView = 'day' | 'week' | 'month';

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateKey(key: string): Date {
  return new Date(`${key}T00:00:00`);
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const daysSinceMonday = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - daysSinceMonday);
  return result;
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function getRange(view: TimesheetView, refDate: Date): { start: string; end: string } {
  switch (view) {
    case 'day':
      return { start: formatDateKey(refDate), end: formatDateKey(refDate) };
    case 'week': {
      const start = startOfWeek(refDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { start: formatDateKey(start), end: formatDateKey(end) };
    }
    case 'month': {
      const start = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
      const end = endOfMonth(refDate);
      return { start: formatDateKey(start), end: formatDateKey(end) };
    }
  }
}

export function shiftRef(view: TimesheetView, refDate: Date, direction: 1 | -1): Date {
  const result = new Date(refDate);
  if (view === 'day') {
    result.setDate(result.getDate() + direction);
  } else if (view === 'week') {
    result.setDate(result.getDate() + direction * 7);
  } else {
    result.setMonth(result.getMonth() + direction);
  }
  return result;
}

export function formatDayLabel(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return `${WEEKDAY_NAMES[date.getDay()]} ${date.getDate()}`;
}

export function formatRangeLabel(view: TimesheetView, start: string, end: string): string {
  const startDate = parseDateKey(start);
  const endDate = parseDateKey(end);

  if (view === 'day') {
    return `${MONTH_NAMES[startDate.getMonth()]} ${startDate.getDate()}, ${startDate.getFullYear()}`;
  }

  if (view === 'month') {
    return `${MONTH_NAMES[startDate.getMonth()]} ${startDate.getFullYear()}`;
  }

  if (startDate.getMonth() === endDate.getMonth()) {
    return `${MONTH_NAMES[startDate.getMonth()]} ${startDate.getDate()} – ${endDate.getDate()}, ${startDate.getFullYear()}`;
  }

  return `${MONTH_NAMES[startDate.getMonth()]} ${startDate.getDate()} – ${
    MONTH_NAMES[endDate.getMonth()]
  } ${endDate.getDate()}, ${endDate.getFullYear()}`;
}

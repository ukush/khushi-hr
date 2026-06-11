function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(key: string): Date {
  return new Date(`${key}T00:00:00`);
}

export function addDays(date: Date, n: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + n);
  return result;
}

export function enumerateDays(start: Date, end: Date): string[] {
  const days: string[] = [];
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    days.push(getDateKey(d));
  }
  return days;
}

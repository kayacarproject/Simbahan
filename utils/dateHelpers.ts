const MONTHS_SHORT = ['Ene', 'Peb', 'Mar', 'Abr', 'May', 'Hun', 'Hul', 'Ago', 'Set', 'Okt', 'Nob', 'Dis'];

export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr + 'T00:00:00').getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'Kailan lang';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ang nakalipas`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} oras ang nakalipas`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} araw ang nakalipas`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} buwan ang nakalipas`;
  return `${Math.floor(diff / 31536000)} taon ang nakalipas`;
}

export function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

export function formatTime(timeStr: string): string {
  return timeStr;
}

// Live availability badge from the listing's availability data
export function availability(b) {
  if (b.available) return { label: 'Available now', tone: 'ok' };
  if (b.availableFrom) {
    const days = Math.ceil((new Date(b.availableFrom) - Date.now()) / 864e5);
    if (days > 0) return { label: `Available in ${days} day${days > 1 ? 's' : ''}`, tone: 'soon' };
  }
  return { label: 'Full', tone: 'bad' };
}

export const REPORT_TYPES = { wrong_info: 'Wrong info', already_full: 'Already full', scam: 'Scam listing' };
export const STATUSES = ['Pending', 'In Progress', 'Resolved'];

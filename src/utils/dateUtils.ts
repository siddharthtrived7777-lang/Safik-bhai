/**
 * Gujarati Date & Time Utility Functions
 */

export const GUJARATI_MONTHS = [
  'જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન',
  'જુલાઈ', 'ઓગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર'
];

export const GUJARATI_DAYS_SHORT = ['રવિ', 'સોમ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર', 'શનિ'];
export const GUJARATI_DAYS_FULL = ['રવિવાર', 'સોમવાર', 'મંગળવાર', 'બુધવાર', 'ગુરુવાર', 'શુક્રવાર', 'શનિવાર'];

/**
 * Convert standard English digits to Gujarati digits if desired, or return standard numbers
 */
export function toGujaratiNum(num: number | string): string {
  const gujDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
  return String(num).replace(/[0-9]/g, (digit) => gujDigits[parseInt(digit, 10)]);
}

/**
 * Format date nicely in Gujarati
 * e.g., "૧૬ સપ્ટેમ્બર ૨૦૨૬ (બુધવાર)"
 */
export function formatGujaratiDate(dateString: string, includeDay = true): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = date.getDate();
  const month = GUJARATI_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const dayName = GUJARATI_DAYS_FULL[date.getDay()];

  if (includeDay) {
    return `${day} ${month} ${year}, ${dayName}`;
  }
  return `${day} ${month} ${year}`;
}

/**
 * Format time in Gujarati 12-hour format
 * e.g., "સવારે ૧૧:૩૦" or "સાંજે ૦૫:૧૫"
 */
export function formatGujaratiTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  let hours = date.getHours();
  const minutes = date.getMinutes();
  let period = 'સવારે';

  if (hours >= 12 && hours < 16) {
    period = 'બપોરે';
  } else if (hours >= 16 && hours < 20) {
    period = 'સાંજે';
  } else if (hours >= 20 || hours < 4) {
    period = 'રાત્રે';
  }

  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${period} ${displayHours}:${displayMinutes}`;
}

/**
 * Relative shoot timing label: "આજે", "આવતીકાલે", "ગઈકાલે", etc.
 */
export function getRelativeDayLabel(dateString: string): { label: string; isUrgent: boolean; type: 'today' | 'tomorrow' | 'overdue' | 'future' | 'past' } {
  if (!dateString) return { label: '', isUrgent: false, type: 'future' };
  
  const targetDate = new Date(dateString);
  const now = new Date();

  // Normalize to midnight
  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  const diffDays = Math.round((targetMidnight - nowMidnight) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { label: 'આજે', isUrgent: true, type: 'today' };
  } else if (diffDays === 1) {
    return { label: 'આવતીકાલે', isUrgent: true, type: 'tomorrow' };
  } else if (diffDays === -1) {
    return { label: 'ગઈકાલે', isUrgent: false, type: 'past' };
  } else if (diffDays < -1) {
    return { label: `${Math.abs(diffDays)} દિવસ પહેલાં`, isUrgent: false, type: 'overdue' };
  } else if (diffDays <= 7) {
    return { label: `${diffDays} દિવસમાં (${GUJARATI_DAYS_FULL[targetDate.getDay()]})`, isUrgent: false, type: 'future' };
  } else {
    return { label: formatGujaratiDate(dateString, false), isUrgent: false, type: 'future' };
  }
}

/**
 * Check if a date string falls in today
 */
export function isToday(dateString: string): boolean {
  if (!dateString) return false;
  const d = new Date(dateString);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
         d.getMonth() === now.getMonth() &&
         d.getDate() === now.getDate();
}

/**
 * Check if a date string is within the current week (next 7 days)
 */
export function isThisWeek(dateString: string): boolean {
  if (!dateString) return false;
  const target = new Date(dateString);
  const now = new Date();
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const diffDays = (targetMidnight - nowMidnight) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 7;
}

/**
 * Format for HTML datetime-local input (YYYY-MM-DDTHH:mm)
 */
export function toInputDateTimeString(date = new Date()): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${y}-${m}-${d}T${h}:${min}`;
}

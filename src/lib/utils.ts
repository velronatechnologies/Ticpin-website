import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMinPrice(
  event: {
    price_starts_from?: number;
    ticket_categories?: Array<{ price?: number; name?: string; capacity?: number }>;
    layout_json?: string;
  },
  bookedMap?: Record<string, number>
) {
  let prices: number[] = [];

  if (event.ticket_categories && event.ticket_categories.length > 0) {
    event.ticket_categories.forEach(cat => {
      if (cat.price !== undefined && cat.price > 0) {
        if (bookedMap && cat.name && cat.capacity !== undefined && cat.capacity > 0) {
          const booked = bookedMap[cat.name] ?? 0;
          if (booked >= cat.capacity) {
            return; // Skip full/sold out category
          }
        }
        prices.push(cat.price);
      }
    });
  }

  if (event.layout_json) {
    try {
      const layout = JSON.parse(event.layout_json);
      if (layout && Array.isArray(layout.elements)) {
        layout.elements.forEach((el: any) => {
          if (el.type === 'section' && el.price !== undefined) {
            const p = Number(el.price);
            if (!isNaN(p) && p > 0) {
              if (bookedMap && el.name && el.capacity !== undefined && el.capacity > 0) {
                const booked = bookedMap[el.name] ?? 0;
                if (booked >= el.capacity) {
                  return; // Skip full/sold out layout section
                }
              }
              prices.push(p);
            }
          }
        });
      }
    } catch (e) {
      // ignore
    }
  }

  if (prices.length > 0) {
    return Math.min(...prices);
  }
  return event.price_starts_from || 0;
}

export function formatPrice(price: number): string {
  if (price % 1 === 0) {
    return price.toLocaleString('en-IN');
  }
  return price.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatEventDateUTC(iso?: string): string {
  if (!iso) return "";
  try {
    const cleanIso = iso.includes(' ') && !iso.includes('T') ? iso.replace(' ', 'T') : iso;
    const d = new Date(cleanIso);
    if (isNaN(d.getTime())) return iso;
    const day = d.getUTCDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getUTCMonth()];
    const year = d.getUTCFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return iso;
  }
}

export function formatEventDateUTCWithDay(iso?: string, short = false): string {
  if (!iso) return "";
  try {
    const cleanIso = iso.includes(' ') && !iso.includes('T') ? iso.replace(' ', 'T') : iso;
    const d = new Date(cleanIso);
    if (isNaN(d.getTime())) return iso;
    const day = d.getUTCDate();
    const year = d.getUTCFullYear();
    
    if (short) {
      const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const weekday = daysShort[d.getUTCDay()];
      const month = monthsShort[d.getUTCMonth()];
      return `${weekday}, ${day} ${month} ${year}`;
    } else {
      const daysLong = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const monthsLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const weekday = daysLong[d.getUTCDay()];
      const month = monthsLong[d.getUTCMonth()];
      return `${weekday}, ${day} ${month} ${year}`;
    }
  } catch (e) {
    return iso;
  }
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')     // Remove non-alphanumeric, non-space, non-hyphen
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/-+/g, '-')            // Squash multiple hyphens
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
}

export function formatTime12hr(timeStr?: string): string {
  if (!timeStr) return '';
  const s = timeStr.trim();
  if (!s) return '';

  // Already 12-hr format: "6:00 PM", "06:00 PM", "6:00PM"
  if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(s)) {
    return s.toUpperCase();
  }

  // 12-hr format without minutes: "6 PM", "6PM"
  const match12NoMin = s.match(/^(\d{1,2})\s*(AM|PM)$/i);
  if (match12NoMin) {
    const h = parseInt(match12NoMin[1], 10);
    const period = match12NoMin[2].toUpperCase();
    return `${h}:00 ${period}`;
  }

  // 24-hr format with minutes or seconds: "18:00", "18:00:00", "09:30"
  const match24 = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    let h = parseInt(match24[1], 10);
    const m = match24[2];
    if (isNaN(h)) return s;
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${period}`;
  }

  // 24-hr hour only: "18", "9"
  const matchHourOnly = s.match(/^(\d{1,2})$/);
  if (matchHourOnly) {
    let h = parseInt(matchHourOnly[1], 10);
    if (isNaN(h) || h < 0 || h > 23) return s;
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:00 ${period}`;
  }

  return s;
}


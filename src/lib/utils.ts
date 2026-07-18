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
    const d = new Date(iso);
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
    const d = new Date(iso);
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

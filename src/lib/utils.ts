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

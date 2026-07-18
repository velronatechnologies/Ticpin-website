import Link from 'next/link';
import { slugify } from '@/lib/utils';

interface EventCardProps {
  id?: string;
  name: string;
  venueName?: string;
  venueAddress?: string;
  location: string;
  date: string;
  time: string;
  ticketPrice: string;
  image: string;
}

/** Converts a 24-hour "HH:MM" string to "H:MM AM/PM". Returns '' for invalid input. */
function formatTime(raw: string): string {
  if (!raw || !raw.includes(':')) return '';
  const [hStr, mStr] = raw.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return '';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const mm = m.toString().padStart(2, '0');
  return `${h12}:${mm} ${ampm}`;
}

export default function EventCard({
  id = '1',
  name,
  venueName = '',
  venueAddress = '',
  location,
  date,
  time,
  ticketPrice,
  image,
}: EventCardProps) {
  // Get first segment of venueAddress before comma, e.g., "tkt mill"
  const venueFirstSegment = venueAddress
    ? venueAddress.split(',')[0].trim()
    : '';

  const venuePart = venueFirstSegment || venueName;
  const displayLocation = venuePart && location
    ? `${venuePart} | ${location}`
    : (venuePart || location);

  const displayTime = formatTime(time);

  return (
    <Link href={`/events/${slugify(name)}`} className="block">
      <div
        className="overflow-hidden cursor-pointer w-full sm:w-auto flex flex-col"
        style={{
          width: '285px',
          background: 'white',
          borderRadius: '15px',
          border: '1px solid #e1e1e1'
        }}
      >
        <div className="flex-shrink-0 bg-gray-100 overflow-hidden flex items-center justify-center relative"
          style={{ height: '414px', borderRadius: '15px 15px 0px 0px' }}
        >
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            style={{ borderRadius: '15px 15px 0px 0px' }}
          />
        </div>
        <div className="px-3 pt-3 pb-3 flex flex-col justify-between mt-[-10px]" style={{ height: '135px' }}>
          <div className="flex flex-col gap-0.5">
            <div className="text-[13px] font-medium text-[#7B2FF7] font-[family-name:var(--font-anek-latin)]" >
              {date}{displayTime ? ` | ${displayTime}` : ''}
            </div>
            <h3 className="font-semibold text-black leading-[1.2] font-[family-name:var(--font-anek-latin)] line-clamp-2 text-[16px]" style={{ color: 'black' }}>
              {name}
            </h3>
            <p className="text-[13px] text-[#686868] font-[family-name:var(--font-anek-latin)] truncate">
              {displayLocation}
            </p>
          </div>
          <p className="text-[13px] text-[#aeaeae] font-[family-name:var(--font-anek-latin)]">
            <span className="text-[13px] text-[#686868] font-[family-name:var(--font-anek-latin)] ">{ticketPrice} onwards</span>
          </p>
        </div>
      </div>
    </Link>
  );
}

import Link from 'next/link';

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

  return (
    <Link href={`/events/${id}`} className="block">
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
        <div className="px-3 py-5.5 flex flex-col gap-0.5 mt-[-10px]">
          <div className="text-[15px] font-medium text-[#7B2FF7] font-[family-name:var(--font-anek-latin)]" >
            {date} | {time}
          </div>
          <h3 className="text-[23px] font-medium text-black line-clamp-1 leading-tight font-[family-name:var(--font-anek-latin)]" style={{ color: 'black' }}>
            {name}
          </h3>
          <p className="text-[15px] text-[#686868] font-[family-name:var(--font-anek-latin)] pt-0.2">
            {displayLocation}
          </p>
          <p className="text-[15px] text-[#aeaeae] mt-auto font-[family-name:var(--font-anek-latin)]">
            <span className="text-[15px] text-[#686868] font-[family-name:var(--font-anek-latin)] ">{ticketPrice} onwards</span>
          </p>
        </div>
      </div>
    </Link>
  );
}

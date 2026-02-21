import Link from 'next/link';

interface EventCardProps {
  id?: string;
  name: string;
  location: string;
  date: string;
  time: string;
  ticketPrice: string;
  image: string;
  artists?: { name: string; image_url?: string }[];
}

export default function EventCard({
  id = '1',
  name,
  location,
  date,
  time,
  ticketPrice,
  image,
  artists = []
}: EventCardProps) {
  return (
    <div
      className="overflow-hidden cursor-pointer w-full sm:w-auto flex flex-col hover:shadow-lg transition-all"
      style={{
        width: '285px',
        background: 'white',
        borderRadius: '10px',
        border: '1px solid #686868'
      }}
    >
      <div className="flex-shrink-0 bg-gray-100 overflow-hidden flex items-center justify-center"
        style={{ height: '380px' }}
      >
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="p-4 flex flex-col">
        <div className="text-xs font-semibold text-purple-600 mb-2">
          {date} / {time}
        </div>
        <h3 className={`font-bold text-gray-900 mb-1 line-clamp-1 ${name.length > 25 ? 'text-sm' :
            name.length > 20 ? 'text-base' :
              'text-lg'
          }`}>
          {name}
        </h3>

        {artists && artists.length > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-[10px] text-gray-400 font-medium uppercase">Featuring:</span>
            <div className="flex -space-x-2 overflow-hidden">
              {artists.slice(0, 3).map((artist, i) => (
                <div key={i} title={artist.name} className="w-5 h-5 rounded-full border border-white bg-zinc-100 overflow-hidden">
                  <img src={artist.image_url || '/placeholder.jpg'} alt={artist.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            {artists.length > 3 && (
              <span className="text-[10px] text-gray-500">+{artists.length - 3}</span>
            )}
            <span className="text-[11px] text-zinc-600 font-medium truncate ml-1">
              {artists[0].name}{artists.length > 1 ? `, ${artists[1].name}` : ''}
            </span>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-3">{location}</p>
        <div className="mt-auto flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Tickets from <span className="font-semibold text-gray-700">{ticketPrice}</span>
          </p>
          <div className="w-6 h-6 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-200">
            <span className="text-[10px] font-black">→</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import Image from 'next/image';

interface ArtistAvatarProps {
  id?: string;
  name: string;
  image?: string;
}

export default function ArtistAvatar({ id, name, image }: ArtistAvatarProps) {
  // Use id if available, otherwise name (slugified)
  const artistId = id || encodeURIComponent(name);

  return (
    <Link href={`/events/artist/${artistId}`} className="block" onClick={() => window.scrollTo(0, 0)}>
      <div className="flex-shrink-0 flex flex-col items-center gap-2 sm:gap-3 snap-start cursor-pointer">
        <div className="w-[70px] h-[70px] sm:w-[100px] sm:h-[100px] md:w-[130px] md:h-[130px] lg:w-[140px] lg:h-[140px] xl:w-[150px] xl:h-[150px] rounded-full overflow-hidden bg-[#f3f0fd] flex items-center justify-center relative">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover object-center"
            />
          ) : (
            <span className="text-4xl font-bold text-[#7B2FF7] opacity-40 uppercase select-none">
              {name.charAt(0)}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-gray-700 font-medium text-center">{name}</p>
      </div>
    </Link>
  );
}

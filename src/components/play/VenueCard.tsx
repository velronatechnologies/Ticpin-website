import Link from 'next/link';
import { slugify } from '@/lib/utils';

interface VenueCardProps {
    id?: string;
    name: string;
    location: string;
    image?: string;
    priceStartsFrom?: number;
    category?: string;
}

export default function VenueCard({ id = '1', name, location, image, category }: VenueCardProps) {
    return (
        <Link href={`/play/${slugify(name)}`} className="block">
            <div className="group cursor-pointer mx-auto w-full max-w-[329px] h-auto">
                <div className="bg-white rounded-[15px] border border-[#aeaeae]  overflow-hidden flex flex-col h-full">
                    <div className="relative w-full aspect-video overflow-hidden">
                        {image ? (
                            <img
                                src={image}
                                alt={name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-[#F5F5F5]" aria-label={`${name} image unavailable`} />
                        )}
                    </div>
                    <div className="p-5 h-[115px] bg-white border-t border-[#686868] rounded-b-[15px] flex flex-col items-start justify-between font-[family-name:var(--font-anek-latin)] mt-[-14px]">
                        <div className="flex flex-col items-start">
                            <h3 className="text-[24px] font-medium text-black leading-tight">{name}</h3>
                            <div className="text-base text-[#686868] font-medium">
                                {location}
                            </div>
                        </div>
                        <span
                            className="flex items-center justify-center p-2 w-max bg-[#D9D9D9] text-[13px] font-small text-black ml-[-4px] mt-[5px]"
                            style={{

                                height: '20px',
                                borderRadius: '10px'
                            }}
                        >
                            {category || 'Play options'}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

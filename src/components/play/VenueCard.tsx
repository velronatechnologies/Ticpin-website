import Link from 'next/link';

interface VenueCardProps {
    id?: string;
    name: string;
    location: string;
    image: string;
}

export default function VenueCard({ id = '1', name, location, image }: VenueCardProps) {
    return (
        <Link href={`/play/${id}`} className="block">
            <div className="group cursor-pointer mx-auto w-full max-w-[329px] h-[301px]">
                <div className="bg-white rounded-[15px] border border-[#686868] overflow-hidden shadow-sm hover:shadow-md hover:border-black transition-all flex flex-col h-full">
                    <div className="relative w-full h-[185px] overflow-hidden">
                        <img
                            src={image}
                            alt={name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <div className="p-5 h-[116px] bg-white border-t border-[#686868] rounded-b-[15px] flex flex-col justify-between font-[family-name:var(--font-anek-latin)]">
                        <div className="space-y-0.5">
                            <h3 className="text-xl font-bold text-black leading-tight tracking-tight">{name}</h3>
                            <div className="text-base text-[#686868] font-medium">
                                {location}
                            </div>
                        </div>
                        <div>
                            <span className="inline-block px-4 py-1.5 bg-[#D9D9D9] rounded-full text-[12px] font-medium text-black">
                                Play options
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

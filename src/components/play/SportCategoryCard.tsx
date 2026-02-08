'use client';

interface SportCategoryCardProps {
    name: string;
    image: string;
}

export default function SportCategoryCard({ name, image }: SportCategoryCardProps) {
    return (
        <div
            className="w-[172px] h-[235px] rounded-[30px] border border-[#686868] p-4 flex flex-col items-center justify-between hover:scale-105 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md group mx-auto"
            style={{ background: 'linear-gradient(180deg, #FFFFFF 50%, #E7C200 159.52%)' }}
        >
            <span className="text-lg md:text-xl font-bold text-black text-center break-words leading-tight font-[family-name:var(--font-anek-latin)] mt-2">
                {name}
            </span>
            <div className="relative w-full aspect-square flex items-center justify-center">
                <img
                    src={image}
                    alt={name}
                    className="w-[120px] h-[10
                    0px] object-contain drop-shadow-md group-hover:drop-shadow-lg transition-all scale-150"
                />
            </div>
        </div>
    );
}

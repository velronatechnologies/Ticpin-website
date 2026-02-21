import Link from 'next/link';

interface SportCategoryCardProps {
    name: string;
    image: string;
    href?: string;
    onClick?: () => void;
    isActive?: boolean;
}

export default function SportCategoryCard({ name, image, href, onClick, isActive }: SportCategoryCardProps) {
    const content = (
        <div
            onClick={onClick}
            className={`w-[172px] h-[235px] rounded-[30px] p-4 flex flex-col items-center justify-between cursor-pointer shadow-sm group mx-auto transition-all duration-200 ${
                isActive
                    ? 'border-2 border-[#E7C200] scale-[1.03] shadow-lg'
                    : 'border border-[#686868] hover:scale-[1.02] hover:shadow-md'
            }`}
            style={{ background: isActive
                ? 'linear-gradient(180deg, #FFFCED 0%, #E7C200 100%)'
                : 'linear-gradient(180deg, #FFFFFF 50%, #E7C200 159.52%)'
            }}
        >
            <span className="text-xl md:text-2xl font-medium text-black text-center pt-1 break-words leading-tight font-[family-name:var(--font-anek-latin)]">
                {name}
            </span>
            <div className="relative w-full aspect-square flex items-center justify-center">
                <img
                    src={image}
                    alt={name}
                    className="w-[120px] h-[100px] object-contain drop-shadow-md scale-150"
                />
            </div>
        </div>
    );

    if (href && !onClick) {
        return <Link href={href} className="block">{content}</Link>;
    }

    return content;
}

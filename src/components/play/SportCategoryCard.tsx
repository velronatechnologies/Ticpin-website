import Link from 'next/link';

interface SportCategoryCardProps {
    name: string;
    image: string;
    href?: string;
}

export default function SportCategoryCard({ name, image, href }: SportCategoryCardProps) {
    const content = (
        <div
            className="w-[140px] shrink-0 h-auto aspect-[152/215] rounded-[26px] border border-transparent p-3 flex flex-col items-center justify-between cursor-pointer group"
            style={{
                background: 'linear-gradient(180deg, #FFFFFF 50%, #E7C200 159.52%) padding-box, linear-gradient(135deg, #aeaeae 0%, #D0D0D0 100%) border-box',

            }}
        >
            <span className="text-sm md:text-base font-semibold text-black text-center break-words leading-tight font-[family-name:var(--font-anek-latin)]">
                {name}
            </span>
            <div className="relative w-full aspect-square flex items-center justify-center mt-1">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-contain scale-125"
                />
            </div>
        </div>
    );

    if (href) {
        return <Link href={href} className="block">{content}</Link>;
    }

    return content;
}

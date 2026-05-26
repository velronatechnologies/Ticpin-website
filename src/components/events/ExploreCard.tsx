import Link from 'next/link';

const categories = [
  {
    title: 'Music',
    icon: '/events/Events 1.svg',
    color: '#A1BFFF',
    href: '/events/music',
    padding: 'p-10'
  },
  {
    title: 'Comedy',
    icon: '/events/Comedy Icon.jpg 1.svg',
    color: '#FFCA74',
    href: '/events/comedy',
    padding: 'p-6'
  },
  {
    title: 'Shows',
    icon: '/events/Performance Icon 1.svg',
    color: '#FFCECD',
    href: '/events/performance',
    padding: 'p-10'
  },
  {
    title: 'Sports',
    icon: '/events/Sports Icon 2.svg',
    color: '#FFE58A',
    href: '/events/sports',
    padding: 'p-10'
  },
  {
    title: 'Food & Drinks',
    icon: '/events/Dining 1.svg',
    color: '#8290D5',
    href: '/events/food-drinks',
    padding: 'p-10'
  },
  {
    title: 'Night Life',
    icon: '/events/Night Life Icon 1.svg',
    color: '#FAFDAA',
    href: '/events/night-life',
    padding: 'p-10'
  },
  {
    title: 'Fests & Fairs',
    icon: '/events/Fests & Fairs Icon 1.svg',
    color: '#FFC799',
    href: '/events/fests-fairs',
    padding: 'p-10'
  },
  {
    title: 'Screenings',
    icon: '/events/Projector Icon 1.svg',
    color: '#B4E9FF',
    href: '/events/screenings',
    padding: 'p-10'
  },
  {
    title: 'Fitness',
    icon: '/events/Dumbells Icon 1.svg',
    color: '#98C5FF',
    href: '/events/fitness',
    padding: 'p-10'
  },
  {
    title: 'Open Mic',
    icon: '/events/Open Mic Icon 1.svg',
    color: '#FFEF96',
    href: '/events/open-mic',
    padding: 'p-10'
  }
];

export default function ExploreCard() {
  return (
    <div className="flex flex-wrap gap-4 md:gap-5 px-1 max-w-[1280px]">
      {categories.map((cat, index) => (
        <Link
          key={index}
          href={cat.href}
          className="group block"
        >
          <div
            className="w-[140px] shrink-0 h-auto aspect-[152/215] rounded-[26px] border border-transparent p-3 flex flex-col items-center justify-between cursor-pointer group"
            style={{
              background: `linear-gradient(180deg, #FFFFFF 50%, ${cat.color} 159.52%) padding-box, linear-gradient(135deg, #686868 0%, #D0D0D0 100%) border-box`
            }}
          >
            <h3 className="text-sm md:text-base font-semibold text-black text-center break-words leading-tight font-[family-name:var(--font-anek-latin)] uppercase">
              {cat.title}
            </h3>
            <div className="relative w-full aspect-square flex items-center justify-center mt-1 overflow-hidden">
              <img
                src={cat.icon}
                alt={cat.title}
                className="w-full h-full object-contain scale-105"
              />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

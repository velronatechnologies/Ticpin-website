interface FilterButtonProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function FilterButton({ label, active = false, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-1.5 uppercase ${active
        ? 'bg-[#e1e1e1] text-black shadow-inner'
        : 'bg-white text-black'
        }`}
      style={{
        border: '1px solid #aeaeae',
        borderRadius: '10px'
      }}
    >
      {label === 'Filters' && (
        <img src="/filter 1.png" alt="Filter" className="w-[14px] h-[14px] object-contain" />
      )}
      <span>{label}</span>
      {label === 'Filters' && (
        <img src="/filter arrow.svg" alt="arrow" className="w-[8px] h-[5px] ml-0.5" />
      )}
    </button>
  );
}

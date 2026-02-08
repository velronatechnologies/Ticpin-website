interface FilterButtonProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function FilterButton({ label, active = false, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 text-base font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${active
        ? 'bg-[#d9d9d9] opacity-100 text-black shadow-inner'
        : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      style={{
        border: '1px solid #a4a4a4',
        borderRadius: '21px'
      }}
    >
      {label === 'Filters' && (
        <span className="text-xs">⚙️</span>
      )}
      {label}
      {label === 'Filters' && (
        <span className="text-xs ml-1">▼</span>
      )}
    </button>
  );
}

import { Search } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-secondary" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-4 py-2 border border-brand-border rounded-lg text-sm text-brand-text placeholder-brand-secondary focus:outline-none focus:ring-2 focus:ring-sf-blue focus:border-transparent w-full bg-white"
      />
    </div>
  );
}

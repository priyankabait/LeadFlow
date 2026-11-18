
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

function AnimatedNumber({ value, format = 'number' }) {
  const spring = useSpring(0, { stiffness: 80, damping: 18 });

  const display = useTransform(spring, current => {
    const n = Math.round(current);
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD', maximumFractionDigits: 0
      }).format(n);
    }
    return n.toLocaleString();
  });

  useEffect(() => { spring.set(Number(value) || 0); }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-brand-blue',   ring: 'ring-blue-100' },
  green:  { bg: 'bg-green-50',  icon: 'text-green-600',    ring: 'ring-green-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600',   ring: 'ring-purple-100' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-600',   ring: 'ring-orange-100' },
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600',   ring: 'ring-indigo-100' },
};

export default function StatCard({ title, value = 0, icon: Icon, color = 'blue', format = 'number' }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(3,45,96,0.12)' }}
      transition={{ duration: 0.18 }}
      className="bg-white rounded-2xl border border-brand-border p-6 relative overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(3,45,96,0.06), 0 4px 12px rgba(3,45,96,0.04)' }}
    >
      {/* Subtle top gradient accent */}
      <div
        className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl opacity-60"
        style={{ background: 'linear-gradient(90deg, #0176D3, #1B96FF)' }}
      />

      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-brand-secondary leading-tight">{title}</p>
        {Icon && (
          <div className={`icon-circle ${c.bg} ring-1 ${c.ring}`}>
            <Icon size={18} className={c.icon} />
          </div>
        )}
      </div>

      <div className="text-3xl font-bold text-brand-text tracking-tight">
        <AnimatedNumber value={value} format={format} />
      </div>
    </motion.div>
  );
}


import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

function AnimatedNumber({ value, format = 'number' }) {
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 20
  });

  const display = useTransform(spring, (current) => {
    const number = Math.round(current);

    if (format === 'currency') {
      return `₹${number.toLocaleString('en-IN')}`;
    }

    return number.toLocaleString('en-IN');
  });

  useEffect(() => {
    spring.set(Number(value) || 0);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export default function StatCard({
  title,
  value = 0,
  icon: Icon,
  change,
  color = 'blue',
  format = 'number'
}) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-sf-blue',
      border: 'border-blue-100'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      border: 'border-green-100'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      border: 'border-purple-100'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      border: 'border-orange-100'
    },
    indigo: {
      bg: 'bg-indigo-50',
      icon: 'text-indigo-600',
      border: 'border-indigo-100'
    }
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  const isPositive = change > 0;
  const isNeutral = change === 0 || change == null;

  return (
    <motion.div
      whileHover={{
        y: -3,
        boxShadow: '0 10px 30px rgba(3, 45, 96, 0.08)'
      }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-brand-border shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-brand-secondary">
          {title}
        </p>

        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl ${selectedColor.bg} ${selectedColor.border} border flex items-center justify-center`}
          >
            <Icon
              size={20}
              className={selectedColor.icon}
            />
          </div>
        )}
      </div>

      <div className="text-2xl xl:text-3xl font-bold text-brand-text mb-2">
        <AnimatedNumber
          value={value}
          format={format}
        />
      </div>

      {change != null && (
        <div
          className={`flex items-center gap-1 text-xs font-medium ${
            isNeutral
              ? 'text-gray-400'
              : isPositive
                ? 'text-green-600'
                : 'text-red-500'
          }`}
        >
          {isNeutral ? (
            <Minus size={12} />
          ) : isPositive ? (
            <TrendingUp size={12} />
          ) : (
            <TrendingDown size={12} />
          )}

          <span>
            {isNeutral
              ? 'No change'
              : `${Math.abs(change)}% from last month`}
          </span>
        </div>
      )}
    </motion.div>
  );
}

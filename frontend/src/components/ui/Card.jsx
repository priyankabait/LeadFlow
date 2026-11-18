import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = false }) {
  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
        className={`bg-white rounded-2xl border border-brand-border shadow-sm p-6 ${className}`}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <div className={`bg-white rounded-2xl border border-brand-border shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

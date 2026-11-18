import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No records found', message = 'Try adjusting your search or filters.', action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-sf-pale flex items-center justify-center mb-4">
        <Inbox size={32} className="text-sf-blue" />
      </div>
      <h3 className="text-lg font-semibold text-brand-text mb-2">{title}</h3>
      <p className="text-brand-secondary text-sm max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}

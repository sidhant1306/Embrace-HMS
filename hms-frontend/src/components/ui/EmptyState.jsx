import { Inbox } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon = Inbox, title = 'No data found', message = 'There are no items to display right now.' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-navy/5 flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-text-light/40" />
      </div>
      <h3 className="font-heading text-lg font-bold text-navy mb-1">{title}</h3>
      <p className="text-text-secondary text-sm max-w-xs">{message}</p>
    </motion.div>
  );
}

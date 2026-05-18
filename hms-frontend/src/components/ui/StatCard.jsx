import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, gradient = 'from-navy to-navy-light', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-2xl font-heading font-bold text-navy">{value ?? '—'}</p>
          <p className="text-sm text-text-secondary">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import usePagedData from '../../hooks/usePagedData';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';

export default function PatientAppointments() {
  const { data, page, setPage, totalPages, loading, refresh } = usePagedData('/patients/view-own-appointment');
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!cancelReason.trim()) { toast.error('Please enter a reason'); return; }
    setCancelling(true);
    try {
      await api.put(`/patients/cancel-own-appointment/${cancelId}`, { reason: cancelReason });
      toast.success('Appointment cancelled');
      setCancelId(null);
      setCancelReason('');
      refresh();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to cancel');
    }
    setCancelling(false);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="My Appointments" subtitle="View and manage all your appointments" />

      {data.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No appointments" message="You haven't booked any appointments yet." />
      ) : (
        <div className="space-y-4">
          {data.map((a, i) => (
            <motion.div
              key={a.appointmentId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-heading text-base font-bold text-navy truncate">{a.doctorName || 'Doctor'}</h3>
                    <StatusBadge status={a.appointmentStatus} />
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-text-secondary">
                    <span>📅 {a.appointmentDate}</span>
                    {a.appointmentTime && <span>🕐 {new Date(a.appointmentTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
                    {a.appointmentDescription && <span>📝 {a.appointmentDescription}</span>}
                  </div>
                  {a.appointmentCancelReason && (
                    <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {a.appointmentCancelReason}
                    </p>
                  )}
                </div>
                {(a.appointmentStatus === 'PENDING' || a.appointmentStatus === 'APPROVED' || a.appointmentStatus === 'RESCHEDULED') && (
                  <button
                    onClick={() => setCancelId(a.appointmentId)}
                    className="shrink-0 px-4 py-2 text-sm font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancelId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setCancelId(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-navy text-lg">Cancel Appointment</h3>
                <button onClick={() => setCancelId(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
              </div>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation…"
                rows={3}
                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setCancelId(null)} className="flex-1 py-2.5 text-sm font-semibold text-text-secondary border border-gray-200 rounded-xl hover:bg-gray-50">Keep</button>
                <button onClick={handleCancel} disabled={cancelling} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50">
                  {cancelling ? 'Cancelling…' : 'Confirm Cancel'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

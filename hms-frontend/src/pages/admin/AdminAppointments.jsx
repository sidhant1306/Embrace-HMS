import { useState } from 'react';
import { CalendarDays, CheckCircle, Ban, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import usePagedData from '../../hooks/usePagedData';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';

export default function AdminAppointments() {
  const [tab, setTab] = useState('all');
  const todayData = usePagedData('/appointments/today');
  const allData = usePagedData('/appointments/all');
  const { data, page, setPage, totalPages, loading, refresh } = tab === 'today' ? todayData : allData;

  const [acting, setActing] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const handleConfirm = async (id) => {
    setActing(id);
    try { await api.put(`/appointments/confirm-appointment/${id}`); toast.success('Approved'); refresh(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setActing(null);
  };

  const handleComplete = async (id) => {
    setActing(id);
    try { await api.put(`/appointments/complete-appointment/${id}`); toast.success('Completed'); refresh(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setActing(null);
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) { toast.error('Please enter a reason'); return; }
    setCancelling(true);
    try {
      await api.put(`/appointments/cancel-appointment/${cancelModal}`, { appointmentCancelReason: cancelReason });
      toast.success('Cancelled');
      setCancelModal(null);
      setCancelReason('');
      refresh();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setCancelling(false);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Appointments" subtitle="View and manage all hospital appointments" />

      {/* Tab Toggle */}
      <div className="flex gap-2 mb-6">
        {[{ key: 'all', label: 'All Appointments' }, { key: 'today', label: "Today's" }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${tab === t.key ? 'bg-gradient-to-r from-navy to-navy-light text-white shadow-md' : 'bg-white text-text-secondary border border-gray-200 hover:border-navy/40'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No appointments" message="No appointments found." />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 font-semibold text-text-secondary">Patient</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">Doctor</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">Time</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-text-secondary">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((a) => (
                  <tr key={a.appointmentId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-primary">{a.patientName || '—'}</td>
                    <td className="px-4 py-4 text-text-secondary">{a.doctorName || '—'}</td>
                    <td className="px-4 py-4 text-text-secondary">{a.appointmentDate}</td>
                    <td className="px-4 py-4 text-text-secondary">{a.appointmentTime ? new Date(a.appointmentTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td className="px-4 py-4"><StatusBadge status={a.appointmentStatus} /></td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {(a.appointmentStatus === 'PENDING' || a.appointmentStatus === 'RESCHEDULED') && (
                          <button onClick={() => handleConfirm(a.appointmentId)} disabled={acting === a.appointmentId} className="flex items-center gap-1 text-xs font-semibold text-teal hover:text-teal-dark disabled:opacity-50">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                        )}
                        {a.appointmentStatus === 'APPROVED' && (
                          <button onClick={() => handleComplete(a.appointmentId)} disabled={acting === a.appointmentId} className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50">
                            <CheckCircle className="w-3.5 h-3.5" /> Complete
                          </button>
                        )}
                        {(a.appointmentStatus === 'PENDING' || a.appointmentStatus === 'APPROVED' || a.appointmentStatus === 'RESCHEDULED') && (
                          <button onClick={() => { setCancelModal(a.appointmentId); setCancelReason(''); }} className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600">
                            <Ban className="w-3.5 h-3.5" /> Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 pb-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
        </div>
      )}

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancelModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setCancelModal(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-navy text-lg">Cancel Appointment</h3>
                <button onClick={() => setCancelModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
              </div>
              <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Reason for cancellation…" rows={3} className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none resize-none" />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setCancelModal(null)} className="flex-1 py-2.5 text-sm font-semibold text-text-secondary border border-gray-200 rounded-xl hover:bg-gray-50">Keep</button>
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

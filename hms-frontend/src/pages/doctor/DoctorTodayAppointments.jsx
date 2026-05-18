import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, CheckCircle, Play, Stethoscope, X, Ban, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import usePagedData from '../../hooks/usePagedData';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';

export default function DoctorTodayAppointments() {
  const [tab, setTab] = useState('today');
  const todayData = usePagedData('/appointments/today');
  const allData = usePagedData('/appointments/all');
  const { data, page, setPage, totalPages, loading, refresh } = tab === 'today' ? todayData : allData;

  const [acting, setActing] = useState(null);
  const [consultModal, setConsultModal] = useState(null);
  const [consultForm, setConsultForm] = useState({ consultationComplaint: '', consultationDiagnosis: '', consultationNotes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const handleConfirm = async (id) => {
    setActing(id);
    try { await api.put(`/appointments/confirm-appointment/${id}`); toast.success('Appointment approved'); refresh(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setActing(null);
  };

  const handleComplete = async (id) => {
    setActing(id);
    try { await api.put(`/appointments/complete-appointment/${id}`); toast.success('Completed'); refresh(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setActing(null);
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) { toast.error('Please enter a reason'); return; }
    setSubmitting(true);
    try {
      await api.put(`/appointments/cancel-appointment/${cancelModal}`, { appointmentCancelReason: cancelReason });
      toast.success('Appointment cancelled');
      setCancelModal(null);
      setCancelReason('');
      refresh();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setSubmitting(false);
  };

  const openConsultation = (appt) => {
    setConsultModal(appt);
    setConsultForm({ consultationComplaint: '', consultationDiagnosis: '', consultationNotes: '' });
  };

  const handleStartConsultation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/consultations/start/${consultModal.appointmentId}`, consultForm);
      toast.success('Consultation started successfully!');
      setConsultModal(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start consultation');
    }
    setSubmitting(false);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Appointments" subtitle="Manage and review patient appointments" />

      {/* Tab Toggle */}
      <div className="flex gap-2 mb-6">
        {[{ key: 'today', label: "Today's" }, { key: 'all', label: 'All Appointments' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${tab === t.key ? 'bg-gradient-to-r from-teal to-teal-dark text-white shadow-md' : 'bg-white text-text-secondary border border-gray-200 hover:border-teal/40'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No appointments" message={tab === 'today' ? "Your schedule is clear for today." : "No appointments found."} />
      ) : (
        <div className="space-y-4">
          {data.map((a, i) => (
            <motion.div key={a.appointmentId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-heading text-base font-bold text-navy">{a.patientName || 'Patient'}</h3>
                    <StatusBadge status={a.appointmentStatus} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 text-sm text-text-secondary">
                    <span>📅 {a.appointmentDate}</span>
                    <span>🕐 {a.appointmentTime ? new Date(a.appointmentTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                    {a.appointmentDescription && <span>📝 {a.appointmentDescription}</span>}
                  </div>
                  {a.appointmentCancelReason && (
                    <p className="mt-1 text-xs text-red-500">Reason: {a.appointmentCancelReason}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap">
                  {(a.appointmentStatus === 'PENDING' || a.appointmentStatus === 'RESCHEDULED') && (
                    <button onClick={() => handleConfirm(a.appointmentId)} disabled={acting === a.appointmentId} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-teal border border-teal/30 rounded-xl hover:bg-teal/5 transition-colors disabled:opacity-50">
                      <Play className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                  {a.appointmentStatus === 'APPROVED' && (
                    <>
                      <button onClick={() => openConsultation(a)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">
                        <Stethoscope className="w-3.5 h-3.5" /> Start Consultation
                      </button>
                      <button onClick={() => handleComplete(a.appointmentId)} disabled={acting === a.appointmentId} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                        <CheckCircle className="w-3.5 h-3.5" /> Complete
                      </button>
                    </>
                  )}
                  {(a.appointmentStatus === 'PENDING' || a.appointmentStatus === 'APPROVED' || a.appointmentStatus === 'RESCHEDULED') && (
                    <button onClick={() => { setCancelModal(a.appointmentId); setCancelReason(''); }} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                      <Ban className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Start Consultation Modal */}
      <AnimatePresence>
        {consultModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setConsultModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="font-heading text-lg font-bold text-navy">Start Consultation</h2>
                  <p className="text-sm text-text-secondary">Patient: {consultModal.patientName}</p>
                </div>
                <button onClick={() => setConsultModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-text-secondary" /></button>
              </div>
              <form onSubmit={handleStartConsultation} className="p-6 space-y-4">
                <div><label className="block text-xs font-semibold text-text-secondary mb-1">Chief Complaint</label><textarea value={consultForm.consultationComplaint} onChange={e => setConsultForm({...consultForm, consultationComplaint: e.target.value})} rows={2} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none resize-none" placeholder="Patient's primary complaint..." /></div>
                <div><label className="block text-xs font-semibold text-text-secondary mb-1">Diagnosis</label><textarea value={consultForm.consultationDiagnosis} onChange={e => setConsultForm({...consultForm, consultationDiagnosis: e.target.value})} rows={2} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none resize-none" placeholder="Initial diagnosis..." /></div>
                <div><label className="block text-xs font-semibold text-text-secondary mb-1">Notes</label><textarea value={consultForm.consultationNotes} onChange={e => setConsultForm({...consultForm, consultationNotes: e.target.value})} rows={3} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none resize-none" placeholder="Additional consultation notes..." /></div>
                <button type="submit" disabled={submitting} className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                  {submitting ? 'Starting...' : 'Start Consultation'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancelModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setCancelModal(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-navy text-lg">Cancel Appointment</h3>
                <button onClick={() => setCancelModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
              </div>
              <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason for cancellation…" rows={3} className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none resize-none" />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setCancelModal(null)} className="flex-1 py-2.5 text-sm font-semibold text-text-secondary border border-gray-200 rounded-xl hover:bg-gray-50">Keep</button>
                <button onClick={handleCancel} disabled={submitting} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50">
                  {submitting ? 'Cancelling…' : 'Confirm Cancel'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

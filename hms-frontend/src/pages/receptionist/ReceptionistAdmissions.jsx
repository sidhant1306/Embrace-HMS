import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BedDouble, Plus, X, LogOut as DischargeIcon, Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import usePagedData from '../../hooks/usePagedData';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';

export default function ReceptionistAdmissions() {
  const { data, page, setPage, totalPages, loading, refresh } = usePagedData('/admissions/active');

  // Admit modal state
  const [showAdmit, setShowAdmit] = useState(false);
  const [admitForm, setAdmitForm] = useState({ patientId: '', bedId: '' });
  const [admitSubmitting, setAdmitSubmitting] = useState(false);

  // Discharge modal state
  const [dischargeModal, setDischargeModal] = useState(null);
  const [dischargeSummary, setDischargeSummary] = useState('');
  const [dischargeSubmitting, setDischargeSubmitting] = useState(false);

  // Available beds for admit modal
  const [availableBeds, setAvailableBeds] = useState([]);
  const [loadingBeds, setLoadingBeds] = useState(false);

  const fetchAvailableBeds = async () => {
    setLoadingBeds(true);
    try {
      const res = await api.get('/beds?status=AVAILABLE&page=0&size=100');
      setAvailableBeds(res.data?.content || []);
    } catch {
      setAvailableBeds([]);
    }
    setLoadingBeds(false);
  };

  const openAdmitModal = () => {
    setAdmitForm({ patientId: '', bedId: '' });
    setShowAdmit(true);
    fetchAvailableBeds();
  };

  const handleAdmit = async (e) => {
    e.preventDefault();
    setAdmitSubmitting(true);
    try {
      await api.post('/admissions/admit', {
        patientId: parseInt(admitForm.patientId),
        bedId: parseInt(admitForm.bedId),
      });
      toast.success('Patient admitted successfully!');
      setShowAdmit(false);
      setAdmitForm({ patientId: '', bedId: '' });
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to admit patient');
    }
    setAdmitSubmitting(false);
  };

  const handleDischarge = async () => {
    setDischargeSubmitting(true);
    try {
      await api.put(`/admissions/${dischargeModal.admissionId}/discharge`, {
        dischargeSummary: dischargeSummary || undefined,
      });
      toast.success('Patient discharged successfully!');
      setDischargeModal(null);
      setDischargeSummary('');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to discharge patient');
    }
    setDischargeSubmitting(false);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="IPD Admissions" subtitle="Manage patient admissions and discharges" />
        <button
          onClick={openAdmitModal}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" /> Admit Patient
        </button>
      </div>

      {data.length === 0 ? (
        <EmptyState icon={BedDouble} title="No active admissions" message="There are no patients currently admitted." />
      ) : (
        <div className="space-y-4">
          {data.map((a, i) => (
            <motion.div
              key={a.admissionId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading text-base font-bold text-navy truncate">
                      {a.patientName || `Patient #${a.patientId}`}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-text-secondary">
                      <span>🛏️ Bed {a.bedNumber} — {a.wardName}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {a.admittedAt ? new Date(a.admittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={a.status} />
                  {a.status === 'ADMITTED' && (
                    <button
                      onClick={() => { setDischargeModal(a); setDischargeSummary(''); }}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <DischargeIcon className="w-3.5 h-3.5" /> Discharge
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Admit Patient Modal */}
      <AnimatePresence>
        {showAdmit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowAdmit(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-heading text-lg font-bold text-navy">Admit Patient</h2>
                <button onClick={() => setShowAdmit(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-text-secondary" /></button>
              </div>
              <form onSubmit={handleAdmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Patient ID *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={admitForm.patientId}
                    onChange={e => setAdmitForm({ ...admitForm, patientId: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none"
                    placeholder="Enter patient ID"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Select Bed *</label>
                  {loadingBeds ? (
                    <p className="text-sm text-text-light py-2">Loading available beds...</p>
                  ) : availableBeds.length === 0 ? (
                    <p className="text-sm text-red-500 py-2">No available beds found.</p>
                  ) : (
                    <select
                      required
                      value={admitForm.bedId}
                      onChange={e => setAdmitForm({ ...admitForm, bedId: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none"
                    >
                      <option value="">— Select a bed —</option>
                      {availableBeds.map(b => (
                        <option key={b.bedId} value={b.bedId}>
                          Bed {b.bedNumber} — {b.wardName} (₹{(b.dailyRatePaise / 100).toFixed(0)}/day)
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={admitSubmitting || availableBeds.length === 0}
                  className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {admitSubmitting ? 'Admitting...' : 'Admit Patient'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discharge Modal */}
      <AnimatePresence>
        {dischargeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setDischargeModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="font-heading text-lg font-bold text-navy">Discharge Patient</h2>
                  <p className="text-sm text-text-secondary">
                    {dischargeModal.patientName || `Patient #${dischargeModal.patientId}`} — Bed {dischargeModal.bedNumber}
                  </p>
                </div>
                <button onClick={() => setDischargeModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-text-secondary" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Discharge Summary (optional)</label>
                  <textarea
                    value={dischargeSummary}
                    onChange={e => setDischargeSummary(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none resize-none"
                    placeholder="Enter discharge summary or notes..."
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setDischargeModal(null)} className="flex-1 py-2.5 text-sm font-semibold text-text-secondary border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                  <button
                    onClick={handleDischarge}
                    disabled={dischargeSubmitting}
                    className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    {dischargeSubmitting ? 'Discharging...' : 'Confirm Discharge'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

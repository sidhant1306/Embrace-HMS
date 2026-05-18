import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BedDouble, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import usePagedData from '../../hooks/usePagedData';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';

const STATUS_OPTIONS = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'];

export default function AdminBeds() {
  const { data, page, setPage, totalPages, loading, refresh } = usePagedData('/beds');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ bedNumber: '', wardName: '', dailyRatePaise: '' });
  const [updatingId, setUpdatingId] = useState(null);

  const handleAddBed = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/beds', { ...form, dailyRatePaise: parseInt(form.dailyRatePaise) || 0 });
      toast.success('Bed added successfully!');
      setShowForm(false);
      setForm({ bedNumber: '', wardName: '', dailyRatePaise: '' });
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add bed');
    }
    setSubmitting(false);
  };

  const handleStatusChange = async (bedId, newStatus) => {
    setUpdatingId(bedId);
    try {
      await api.put(`/beds/${bedId}/status`, { status: newStatus });
      toast.success(`Bed status updated to ${newStatus}`);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
    setUpdatingId(null);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Beds / IPD" subtitle="Manage hospital bed availability" />
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl shadow-md hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> Add Bed
        </button>
      </div>

      {data.length === 0 ? (
        <EmptyState icon={BedDouble} title="No beds configured" message="No beds have been added to the system yet. Click 'Add Bed' to get started." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((b, i) => (
            <motion.div key={b.bedId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-lg font-bold text-navy">Bed {b.bedNumber}</h3>
                <StatusBadge status={b.status} />
              </div>
              <div className="space-y-1 text-sm text-text-secondary mb-4">
                <p>Ward: <span className="font-medium text-text-primary">{b.wardName}</span></p>
                <p>Rate: <span className="font-medium text-text-primary">₹{(b.dailyRatePaise / 100).toFixed(2)}/day</span></p>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-light uppercase mb-1">Update Status</label>
                <select
                  value={b.status}
                  onChange={(e) => handleStatusChange(b.bedId, e.target.value)}
                  disabled={updatingId === b.bedId}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <div className="mt-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>

      {/* Add Bed Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-heading text-lg font-bold text-navy">Add New Bed</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-text-secondary" /></button>
              </div>
              <form onSubmit={handleAddBed} className="p-6 space-y-4">
                <div><label className="block text-xs font-semibold text-text-secondary mb-1">Bed Number *</label><input required value={form.bedNumber} onChange={e => setForm({...form, bedNumber: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="e.g. B-101" /></div>
                <div><label className="block text-xs font-semibold text-text-secondary mb-1">Ward Name *</label><input required value={form.wardName} onChange={e => setForm({...form, wardName: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="e.g. General Ward" /></div>
                <div><label className="block text-xs font-semibold text-text-secondary mb-1">Daily Rate (in paise) *</label><input type="number" required min={0} value={form.dailyRatePaise} onChange={e => setForm({...form, dailyRatePaise: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="e.g. 50000 (= ₹500)" /></div>
                <button type="submit" disabled={submitting} className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                  {submitting ? 'Adding...' : 'Add Bed'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

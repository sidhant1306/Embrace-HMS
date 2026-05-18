import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, X, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import usePagedData from '../../hooks/usePagedData';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';

export default function PharmacistInventory() {
  const { data, page, setPage, totalPages, loading, refresh } = usePagedData('/pharmacy/get-all-medicine');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ medicineName: '', medicineCategory: '', medicineStock: '', medicinePrice: '', medicineExpiryDate: '' });

  const resetForm = () => setForm({ medicineName: '', medicineCategory: '', medicineStock: '', medicinePrice: '', medicineExpiryDate: '' });

  const openAdd = () => { resetForm(); setEditId(null); setShowForm(true); };
  const openEdit = (m) => {
    setForm({
      medicineName: m.medicineName || '',
      medicineCategory: m.medicineCategory || '',
      medicineStock: m.medicineStock?.toString() || '',
      medicinePrice: m.medicinePrice || '',
      medicineExpiryDate: m.medicineExpiryDate || '',
    });
    setEditId(m.medicineId);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { ...form, medicineStock: parseInt(form.medicineStock) || 0 };
    try {
      if (editId) {
        await api.put(`/pharmacy/update-medicine/${editId}`, payload);
        toast.success('Medicine updated!');
      } else {
        await api.post('/pharmacy/add-medicine', payload);
        toast.success('Medicine added!');
      }
      setShowForm(false);
      resetForm();
      setEditId(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setSubmitting(false);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Medicine Inventory" subtitle="View and manage medicine stock" />
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-md hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> Add Medicine
        </button>
      </div>

      {data.length === 0 ? (
        <EmptyState icon={Package} title="Empty inventory" message="No medicines have been added yet. Click 'Add Medicine' to get started." />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 font-semibold text-text-secondary">Medicine</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-secondary">Category</th>
                  <th className="text-right px-4 py-3 font-semibold text-text-secondary">Stock</th>
                  <th className="text-right px-4 py-3 font-semibold text-text-secondary">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-secondary">Expiry</th>
                  <th className="px-4 py-3"></th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {data.map((m) => (
                    <tr key={m.medicineId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-text-primary">{m.medicineName}</td>
                      <td className="px-4 py-4 text-text-secondary">{m.medicineCategory || '—'}</td>
                      <td className="px-4 py-4 text-right">
                        <span className={`font-bold ${m.medicineStock <= 10 ? 'text-red-500' : 'text-text-primary'}`}>{m.medicineStock}</span>
                      </td>
                      <td className="px-4 py-4 text-right text-text-secondary">{m.medicinePrice || '—'}</td>
                      <td className="px-4 py-4 text-text-secondary">{m.medicineExpiryDate || '—'}</td>
                      <td className="px-4 py-4">
                        <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-teal/10 text-text-light hover:text-teal transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 pb-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
          </div>
        </>
      )}

      {/* Add/Edit Medicine Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-heading text-lg font-bold text-navy">{editId ? 'Edit Medicine' : 'Add New Medicine'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-text-secondary" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div><label className="block text-xs font-semibold text-text-secondary mb-1">Medicine Name *</label><input required value={form.medicineName} onChange={e => setForm({...form, medicineName: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="e.g. Paracetamol 500mg" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-text-secondary mb-1">Category</label><input value={form.medicineCategory} onChange={e => setForm({...form, medicineCategory: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="e.g. Analgesic" /></div>
                  <div><label className="block text-xs font-semibold text-text-secondary mb-1">Stock *</label><input type="number" required min={0} value={form.medicineStock} onChange={e => setForm({...form, medicineStock: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="100" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-text-secondary mb-1">Price *</label><input required value={form.medicinePrice} onChange={e => setForm({...form, medicinePrice: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="₹50.00" /></div>
                  <div><label className="block text-xs font-semibold text-text-secondary mb-1">Expiry Date *</label><input type="date" required value={form.medicineExpiryDate} onChange={e => setForm({...form, medicineExpiryDate: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" /></div>
                </div>
                <button type="submit" disabled={submitting} className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                  {submitting ? 'Saving...' : (editId ? 'Update Medicine' : 'Add Medicine')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

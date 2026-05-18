import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import PageHeader from '../../components/ui/PageHeader';

export default function PharmacistDispense() {
  const [prescriptionId, setPrescriptionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleDispense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await api.post('/pharmacy/dispense-prescription', { prescriptionId: parseInt(prescriptionId) });
      toast.success('Prescription dispensed successfully!');
      setResult(res.data);
      setPrescriptionId('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispense prescription');
    }
    setSubmitting(false);
  };

  return (
    <div>
      <PageHeader title="Dispense Medicine" subtitle="Dispense medicines against prescriptions" />

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-lg">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-4 shadow-lg">
          <Pill className="w-7 h-7 text-white" />
        </div>
        <h3 className="font-heading text-lg font-bold text-navy mb-1">Dispense by Prescription ID</h3>
        <p className="text-sm text-text-secondary mb-4">Enter the prescription ID to dispense all medicines in the prescription.</p>

        <form onSubmit={handleDispense} className="flex gap-3">
          <input
            type="number"
            required
            min={1}
            value={prescriptionId}
            onChange={e => setPrescriptionId(e.target.value)}
            className="flex-1 px-4 py-3 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none"
            placeholder="Prescription ID"
          />
          <button type="submit" disabled={submitting} className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 shrink-0">
            {submitting ? 'Dispensing...' : 'Dispense'}
          </button>
        </form>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-green-700 mb-1">✅ Dispensed Successfully</p>
            <p className="text-xs text-green-600">Issued ID: {result.medicineIssuedId || '—'}</p>
            {result.issuedDate && <p className="text-xs text-green-600">Date: {new Date(result.issuedDate).toLocaleString('en-IN')}</p>}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

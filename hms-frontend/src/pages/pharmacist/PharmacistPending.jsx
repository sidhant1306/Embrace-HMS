import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Pill } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import usePagedData from '../../hooks/usePagedData';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';

export default function PharmacistPending() {
  const { data, page, setPage, totalPages, loading, refresh } = usePagedData('/pharmacy/get-pending-dispenses');
  const [dispensing, setDispensing] = useState(null);

  const handleDispense = async (prescriptionId) => {
    setDispensing(prescriptionId);
    try {
      await api.post('/pharmacy/dispense-prescription', { prescriptionId });
      toast.success('Prescription dispensed successfully!');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispense');
    }
    setDispensing(null);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Pending Prescriptions" subtitle="Prescriptions waiting to be dispensed" />
      {data.length === 0 ? (
        <EmptyState icon={FileText} title="All caught up!" message="No pending prescriptions to dispense." />
      ) : (
        <div className="space-y-4">
          {data.map((rx, i) => (
            <motion.div key={rx.prescriptionId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-heading text-base font-bold text-navy">#{rx.prescriptionNumber || rx.prescriptionId} — {rx.patientName || 'Patient'}</h3>
                    <StatusBadge status={rx.prescriptionStatus} />
                  </div>
                  {rx.prescriptionItems?.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                      {rx.prescriptionItems.map((item, idx) => (
                        <p key={idx} className="text-sm text-text-secondary">
                          <span className="font-medium text-text-primary">{item.medicineName}</span> — {item.medicineDosage}, {item.medicineFrequency}x/day, {item.medicineDurationDays} days
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDispense(rx.prescriptionId)}
                  disabled={dispensing === rx.prescriptionId}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 shrink-0"
                >
                  <Pill className="w-4 h-4" /> {dispensing === rx.prescriptionId ? 'Dispensing...' : 'Dispense'}
                </button>
              </div>
            </motion.div>
          ))}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

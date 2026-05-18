import { FileText, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import usePagedData from '../../hooks/usePagedData';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';

export default function PatientPrescriptions() {
  const { data, page, setPage, totalPages, loading } = usePagedData('/patients/view-own-prescriptions');

  const handleDownload = async (id) => {
    try {
      const res = await api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescription-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Prescriptions" subtitle="View your prescribed medications and download PDFs" />
      {data.length === 0 ? (
        <EmptyState icon={FileText} title="No prescriptions" message="You don't have any prescriptions yet." />
      ) : (
        <div className="space-y-4">
          {data.map((rx, i) => (
            <motion.div key={rx.prescriptionId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-heading text-base font-bold text-navy">#{rx.prescriptionNumber || rx.prescriptionId}</h3>
                    <StatusBadge status={rx.prescriptionStatus} />
                  </div>
                  <p className="text-sm text-text-secondary mb-3">{rx.prescriptionNotes || 'No notes'}</p>
                  {rx.prescriptionItems?.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                      {rx.prescriptionItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                          <span className="w-5 h-5 rounded-full bg-teal/10 text-teal flex items-center justify-center text-[10px] font-bold shrink-0">{idx + 1}</span>
                          <span className="font-medium text-text-primary">{item.medicineName}</span>
                          <span className="text-text-light">—</span>
                          <span className="text-text-secondary">{item.medicineDosage}, {item.medicineFrequency}x/day for {item.medicineDurationDays} days</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-text-light mt-2">Created: {rx.prescriptionCreatedAt ? new Date(rx.prescriptionCreatedAt).toLocaleDateString('en-IN') : 'N/A'}</p>
                </div>
                <button onClick={() => handleDownload(rx.prescriptionId)} className="shrink-0 p-2.5 rounded-xl border border-gray-200 hover:bg-teal/5 hover:border-teal/30 transition-colors" title="Download PDF">
                  <Download className="w-4 h-4 text-teal" />
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

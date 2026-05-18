import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Printer, Download, FlaskConical } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import usePagedData from '../../hooks/usePagedData';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';

export default function ReceptionistPrescriptions() {
  const { data, page, setPage, totalPages, loading, refresh } = usePagedData('/prescriptions/incoming');
  const [acting, setActing] = useState(null);

  const handleMarkPrinted = async (id) => {
    setActing(id);
    try {
      await api.put(`/prescriptions/mark-as-printed/${id}`);
      toast.success('Marked as printed');
      refresh();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to mark as printed');
    }
    setActing(null);
  };

  const handleDownloadPdf = async (id) => {
    try {
      const res = await api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch {
      toast.error('Failed to download PDF');
    }
  };

  const handleSendToLab = async (id) => {
    setActing(id);
    try {
      await api.put(`/prescriptions/send-to-lab-technician/${id}`);
      toast.success('Sent to Lab Technician');
      refresh();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
    setActing(null);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Prescriptions" subtitle="View incoming prescriptions and manage printing" />
      {data.length === 0 ? (
        <EmptyState icon={FileText} title="No incoming prescriptions" message="All prescriptions have been processed." />
      ) : (
        <div className="space-y-4">
          {data.map((rx, i) => (
            <motion.div
              key={rx.prescriptionId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-heading text-base font-bold text-navy">
                      #{rx.prescriptionNumber || rx.prescriptionId} — {rx.patientName || 'Patient'}
                    </h3>
                    <StatusBadge status={rx.prescriptionStatus} />
                  </div>
                  {rx.prescriptionNotes && (
                    <p className="text-sm text-text-secondary mb-2">📝 {rx.prescriptionNotes}</p>
                  )}
                  {rx.prescriptionItems?.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                      {rx.prescriptionItems.map((item, idx) => (
                        <p key={idx} className="text-sm text-text-secondary">
                          <span className="font-medium text-text-primary">{item.medicineName}</span>
                          {' — '}{item.medicineDosage}, {item.medicineFrequency}x/day, {item.medicineDurationDays} days
                          {item.medicineInstructions && <span className="text-text-light"> ({item.medicineInstructions})</span>}
                        </p>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-text-light mt-2">
                    {rx.prescriptionCreatedAt ? new Date(rx.prescriptionCreatedAt).toLocaleDateString('en-IN') : ''}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap">
                  {(rx.prescriptionStatus === 'SENT_TO_RECEPTIONIST' || rx.prescriptionStatus === 'WRITTEN') && (
                    <button
                      onClick={() => handleMarkPrinted(rx.prescriptionId)}
                      disabled={acting === rx.prescriptionId}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-600 border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors disabled:opacity-50"
                    >
                      <Printer className="w-3.5 h-3.5" /> Mark Printed
                    </button>
                  )}
                  {(rx.prescriptionStatus === 'SENT_TO_RECEPTIONIST' || rx.prescriptionStatus === 'PRINTED') && (
                    <button
                      onClick={() => handleSendToLab(rx.prescriptionId)}
                      disabled={acting === rx.prescriptionId}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-600 border border-amber-200 rounded-xl hover:bg-amber-50 transition-colors disabled:opacity-50"
                    >
                      <FlaskConical className="w-3.5 h-3.5" /> Send to Lab
                    </button>
                  )}
                  <button
                    onClick={() => handleDownloadPdf(rx.prescriptionId)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-teal border border-teal/30 rounded-xl hover:bg-teal/5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

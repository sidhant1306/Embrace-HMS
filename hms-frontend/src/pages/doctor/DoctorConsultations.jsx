import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, CheckCircle, FileText, ClipboardList, X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import usePagedData from '../../hooks/usePagedData';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';

export default function DoctorConsultations() {
  const { data, page, setPage, totalPages, loading, refresh } = usePagedData('/consultations/my');
  const [acting, setActing] = useState(null);

  // Prescription modal state
  const [rxModal, setRxModal] = useState(null);
  const [rxForm, setRxForm] = useState({ prescriptionNotes: '', prescriptionItems: [{ medicineName: '', medicineDosage: '', medicineDurationDays: 1, medicineFrequency: 1, medicineInstructions: '' }] });
  const [rxSubmitting, setRxSubmitting] = useState(false);

  // Lab order modal state
  const [labModal, setLabModal] = useState(null);
  const [labForm, setLabForm] = useState({ labOrderTestName: '', labOrderTestUrgency: 'NORMAL', labOrderNotes: '' });
  const [labSubmitting, setLabSubmitting] = useState(false);

  const handleComplete = async (id) => {
    setActing(id);
    try { await api.put(`/consultations/complete/${id}`); toast.success('Consultation completed'); refresh(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setActing(null);
  };

  // Prescription handlers
  const addRxItem = () => setRxForm({ ...rxForm, prescriptionItems: [...rxForm.prescriptionItems, { medicineName: '', medicineDosage: '', medicineDurationDays: 1, medicineFrequency: 1, medicineInstructions: '' }] });
  const removeRxItem = (idx) => setRxForm({ ...rxForm, prescriptionItems: rxForm.prescriptionItems.filter((_, i) => i !== idx) });
  const updateRxItem = (idx, field, value) => { const items = [...rxForm.prescriptionItems]; items[idx][field] = value; setRxForm({ ...rxForm, prescriptionItems: items }); };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    setRxSubmitting(true);
    try {
      await api.post('/prescriptions/create', {
        consultationId: rxModal.consultationId,
        patientId: rxModal.patientId,
        prescriptionNotes: rxForm.prescriptionNotes,
        prescriptionItems: rxForm.prescriptionItems.map(item => ({
          ...item,
          medicineDurationDays: parseInt(item.medicineDurationDays) || 1,
          medicineFrequency: parseInt(item.medicineFrequency) || 1,
        })),
      });
      toast.success('Prescription created!');
      setRxModal(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create prescription');
    }
    setRxSubmitting(false);
  };

  // Lab order handler
  const handleOrderLab = async (e) => {
    e.preventDefault();
    setLabSubmitting(true);
    try {
      await api.post('/lab/order-test', { ...labForm, consultationId: labModal.consultationId });
      toast.success('Lab test ordered!');
      setLabModal(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to order lab test');
    }
    setLabSubmitting(false);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Consultations" subtitle="View and manage patient consultations" />
      {data.length === 0 ? (
        <EmptyState icon={Stethoscope} title="No consultations" message="No consultations found. Start one from Today's Appointments." />
      ) : (
        <div className="space-y-4">
          {data.map((c, i) => (
            <motion.div key={c.consultationId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-heading text-base font-bold text-navy">{c.patientName || 'Patient'}</h3>
                    <StatusBadge status={c.consultationStatus} />
                  </div>
                  <div className="space-y-1 text-sm text-text-secondary">
                    {c.consultationComplaint && <p><span className="font-medium text-text-primary">Complaint:</span> {c.consultationComplaint}</p>}
                    {c.consultationDiagnosis && <p><span className="font-medium text-text-primary">Diagnosis:</span> {c.consultationDiagnosis}</p>}
                    {c.consultationNotes && <p><span className="font-medium text-text-primary">Notes:</span> {c.consultationNotes}</p>}
                  </div>
                  <p className="text-xs text-text-light mt-2">Date: {c.consultationCreatedAt ? new Date(c.consultationCreatedAt).toLocaleDateString('en-IN') : '—'}</p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {(c.consultationStatus === 'PENDING' || c.consultationStatus === 'IN_PROGRESS' || c.consultationStatus === 'ACTIVE') && (
                    <>
                      <button onClick={() => { setRxModal(c); setRxForm({ prescriptionNotes: '', prescriptionItems: [{ medicineName: '', medicineDosage: '', medicineDurationDays: 1, medicineFrequency: 1, medicineInstructions: '' }] }); }} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-violet-600 border border-violet-200 rounded-xl hover:bg-violet-50 transition-colors">
                        <FileText className="w-3.5 h-3.5" /> Write Rx
                      </button>
                      <button onClick={() => { setLabModal(c); setLabForm({ labOrderTestName: '', labOrderTestUrgency: 'NORMAL', labOrderNotes: '' }); }} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-600 border border-amber-200 rounded-xl hover:bg-amber-50 transition-colors">
                        <ClipboardList className="w-3.5 h-3.5" /> Order Lab
                      </button>
                      <button onClick={() => handleComplete(c.consultationId)} disabled={acting === c.consultationId} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                        <CheckCircle className="w-3.5 h-3.5" /> Complete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Write Prescription Modal */}
      <AnimatePresence>
        {rxModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setRxModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div><h2 className="font-heading text-lg font-bold text-navy">Write Prescription</h2><p className="text-sm text-text-secondary">Patient: {rxModal.patientName}</p></div>
                <button onClick={() => setRxModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-text-secondary" /></button>
              </div>
              <form onSubmit={handleCreatePrescription} className="p-6 space-y-4">
                <div><label className="block text-xs font-semibold text-text-secondary mb-1">Notes</label><textarea value={rxForm.prescriptionNotes} onChange={e => setRxForm({...rxForm, prescriptionNotes: e.target.value})} rows={2} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none resize-none" placeholder="Prescription notes..." /></div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between"><label className="text-xs font-semibold text-text-secondary uppercase">Medicines</label><button type="button" onClick={addRxItem} className="flex items-center gap-1 text-xs font-semibold text-teal hover:text-teal-dark"><Plus className="w-3.5 h-3.5" /> Add Medicine</button></div>
                  {rxForm.prescriptionItems.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4 space-y-3 relative">
                      {rxForm.prescriptionItems.length > 1 && <button type="button" onClick={() => removeRxItem(idx)} className="absolute top-2 right-2 p-1 rounded-lg hover:bg-red-50 text-text-light hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>}
                      <div><input required value={item.medicineName} onChange={e => updateRxItem(idx, 'medicineName', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-teal outline-none" placeholder="Medicine name *" /></div>
                      <div className="grid grid-cols-3 gap-2">
                        <input value={item.medicineDosage} onChange={e => updateRxItem(idx, 'medicineDosage', e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-teal outline-none" placeholder="Dosage" />
                        <input type="number" min={1} value={item.medicineFrequency} onChange={e => updateRxItem(idx, 'medicineFrequency', e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-teal outline-none" placeholder="Freq/day" />
                        <input type="number" min={1} value={item.medicineDurationDays} onChange={e => updateRxItem(idx, 'medicineDurationDays', e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-teal outline-none" placeholder="Days" />
                      </div>
                      <input value={item.medicineInstructions} onChange={e => updateRxItem(idx, 'medicineInstructions', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-teal outline-none" placeholder="Instructions (e.g. After meals)" />
                    </div>
                  ))}
                </div>

                <button type="submit" disabled={rxSubmitting} className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                  {rxSubmitting ? 'Creating...' : 'Create Prescription'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Lab Test Modal */}
      <AnimatePresence>
        {labModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setLabModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div><h2 className="font-heading text-lg font-bold text-navy">Order Lab Test</h2><p className="text-sm text-text-secondary">Patient: {labModal.patientName}</p></div>
                <button onClick={() => setLabModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-text-secondary" /></button>
              </div>
              <form onSubmit={handleOrderLab} className="p-6 space-y-4">
                <div><label className="block text-xs font-semibold text-text-secondary mb-1">Test Name *</label><input required value={labForm.labOrderTestName} onChange={e => setLabForm({...labForm, labOrderTestName: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="e.g. Complete Blood Count" /></div>
                <div><label className="block text-xs font-semibold text-text-secondary mb-1">Urgency</label>
                  <select value={labForm.labOrderTestUrgency} onChange={e => setLabForm({...labForm, labOrderTestUrgency: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none">
                    <option value="NORMAL">Normal</option><option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div><label className="block text-xs font-semibold text-text-secondary mb-1">Notes</label><textarea value={labForm.labOrderNotes} onChange={e => setLabForm({...labForm, labOrderNotes: e.target.value})} rows={2} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none resize-none" placeholder="Additional notes..." /></div>
                <button type="submit" disabled={labSubmitting} className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                  {labSubmitting ? 'Ordering...' : 'Order Lab Test'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

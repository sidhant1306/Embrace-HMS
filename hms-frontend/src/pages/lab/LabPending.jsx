import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, X, Upload, Download, Plus, Trash2, FileText, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import usePagedData from '../../hooks/usePagedData';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { generateLabReportPdf } from '../../utils/labReportPdf';

export default function LabPending() {
  const [tab, setTab] = useState('pending');
  const pendingData = usePagedData('/lab/pending-orders');
  const allData = usePagedData('/lab/all-orders');
  const { data, page, setPage, totalPages, loading, refresh } = tab === 'pending' ? pendingData : allData;

  const [uploadModal, setUploadModal] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [labNotes, setLabNotes] = useState('');
  const [uploadSubmitting, setUploadSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Structured result rows for PDF generation
  const [resultRows, setResultRows] = useState([
    { parameter: '', value: '', unit: '', refRange: '', status: 'Normal' },
  ]);
  const [remarks, setRemarks] = useState('');

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/lab/update-status/${id}?status=${status}`);
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
      refresh();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  const openUploadModal = (order) => {
    setUploadModal(order);
    setUploadFile(null);
    setLabNotes('');
    setRemarks('');
    setResultRows([{ parameter: '', value: '', unit: '', refRange: '', status: 'Normal' }]);
  };

  const addRow = () => {
    setResultRows([...resultRows, { parameter: '', value: '', unit: '', refRange: '', status: 'Normal' }]);
  };

  const removeRow = (idx) => {
    if (resultRows.length <= 1) return;
    setResultRows(resultRows.filter((_, i) => i !== idx));
  };

  const updateRow = (idx, field, val) => {
    const copy = [...resultRows];
    copy[idx] = { ...copy[idx], [field]: val };
    setResultRows(copy);
  };

  const handleGeneratePdf = () => {
    if (!uploadModal) return;
    const blob = generateLabReportPdf({
      patientName: uploadModal.patientName || 'Patient',
      patientId: uploadModal.patientId || '',
      testName: uploadModal.labOrderTestName || 'Lab Test',
      labOrderId: uploadModal.labOrderId || '',
      doctorName: uploadModal.doctorName || '',
      results: resultRows.filter((r) => r.parameter.trim()),
      remarks,
      technicianName: localStorage.getItem('userName') || '',
    });

    // Download it
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-report-${uploadModal.labOrderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    // Auto-attach as the upload file
    const file = new File([blob], `lab-report-${uploadModal.labOrderId}.pdf`, { type: 'application/pdf' });
    setUploadFile(file);
    toast.success('PDF generated & attached!');
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Please attach a file or generate a PDF first');
      return;
    }
    setUploadSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append(
        'dto',
        new Blob(
          [JSON.stringify({
            patientId: uploadModal.patientId || 0,
            doctorNotes: labNotes,
            isViewedByDoctor: false,
            isViewedByPatient: false,
            labOrderId: uploadModal.labOrderId,
          })],
          { type: 'application/json' }
        )
      );
      await api.post(`/lab/upload-report/${uploadModal.labOrderId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Report uploaded & order completed!');
      setUploadModal(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload report');
    }
    setUploadSubmitting(false);
  };

  const handleDownloadPrescriptionPdf = async (consultationId) => {
    try {
      toast.loading('Looking up prescription...', { id: 'rx-lookup' });
      const consultRes = await api.get(`/consultations/${consultationId}`);
      const patientId = consultRes.data.patientId;
      const rxRes = await api.get(`/prescriptions/patient/${patientId}?size=50`);
      const rx = rxRes.data.content?.find((r) => r.consultationId === consultationId);
      if (rx) {
        const res = await api.get(`/prescriptions/${rx.prescriptionId}/pdf`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `prescription-${rx.prescriptionId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Prescription PDF downloaded', { id: 'rx-lookup' });
      } else {
        toast.error('No prescription found for this consultation', { id: 'rx-lookup' });
      }
    } catch {
      toast.error('Failed to download prescription', { id: 'rx-lookup' });
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Lab Orders" subtitle="Process incoming lab test orders" />

      {/* Tab Toggle */}
      <div className="flex gap-2 mb-6">
        {[{ key: 'pending', label: 'Pending Orders' }, { key: 'all', label: 'All Orders' }].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${
              tab === t.key
                ? 'bg-gradient-to-r from-teal to-teal-dark text-white shadow-md'
                : 'bg-white text-text-secondary border border-gray-200 hover:border-teal/40'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No lab orders"
          message={tab === 'pending' ? 'All lab orders have been processed.' : 'No lab orders found.'}
        />
      ) : (
        <div className="space-y-4">
          {data.map((o, i) => (
            <motion.div
              key={o.labOrderId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-heading text-base font-bold text-navy">{o.labOrderTestName}</h3>
                    <StatusBadge status={o.labOrderStatus} />
                    {o.labOrderTestUrgency === 'URGENT' && (
                      <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-lg bg-red-50 text-red-600">
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 text-sm text-text-secondary">
                    <span>Order #{o.labOrderNumber || o.labOrderId}</span>
                    {o.patientName && <span>👤 {o.patientName} (ID: {o.patientId})</span>}
                    {o.doctorName && <span>🩺 {o.doctorName}</span>}
                    {o.consultationId && <span>📋 Consult #{o.consultationId}</span>}
                  </div>
                  {o.labOrderNotes && <p className="text-sm text-text-light mt-1">Notes: {o.labOrderNotes}</p>}
                  <p className="text-xs text-text-light mt-1">
                    {o.labOrderCreatedAt ? new Date(o.labOrderCreatedAt).toLocaleDateString('en-IN') : ''}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap">
                  {o.labOrderStatus === 'ORDERED' && (
                    <button
                      onClick={() => updateStatus(o.labOrderId, 'SAMPLE_COLLECTED')}
                      className="px-4 py-2 text-sm font-semibold text-teal border border-teal/30 rounded-xl hover:bg-teal/5 transition-colors"
                    >
                      Collect Sample
                    </button>
                  )}
                  {o.labOrderStatus === 'SAMPLE_COLLECTED' && (
                    <button
                      onClick={() => updateStatus(o.labOrderId, 'IN_PROGRESS')}
                      className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      Start Processing
                    </button>
                  )}
                  {o.labOrderStatus === 'IN_PROGRESS' && (
                    <button
                      onClick={() => openUploadModal(o)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" /> Complete & Upload
                    </button>
                  )}
                  {o.consultationId && (
                    <button
                      onClick={() => handleDownloadPrescriptionPdf(o.consultationId)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-violet-600 border border-violet-200 rounded-xl hover:bg-violet-50 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Prescription
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* ────────── Upload Report Modal ────────── */}
      <AnimatePresence>
        {uploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setUploadModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
                <div>
                  <h2 className="font-heading text-lg font-bold text-navy">Upload Lab Report</h2>
                  <p className="text-sm text-text-secondary">
                    Test: {uploadModal.labOrderTestName} | Patient: {uploadModal.patientName || 'N/A'} (ID: {uploadModal.patientId})
                  </p>
                </div>
                <button onClick={() => setUploadModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <form onSubmit={handleUploadReport} className="p-6 space-y-5">
                {/* ── Section 1: Test Results Table ── */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading text-sm font-bold text-navy flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal" /> Test Parameters
                    </h3>
                    <button
                      type="button"
                      onClick={addRow}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-teal border border-teal/30 rounded-lg hover:bg-teal/5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Row
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* Table header */}
                    <div className="grid grid-cols-[1fr_0.7fr_0.5fr_0.8fr_0.6fr_auto] gap-2 px-1">
                      <span className="text-[10px] font-bold uppercase text-text-light">Parameter</span>
                      <span className="text-[10px] font-bold uppercase text-text-light">Value</span>
                      <span className="text-[10px] font-bold uppercase text-text-light">Unit</span>
                      <span className="text-[10px] font-bold uppercase text-text-light">Ref. Range</span>
                      <span className="text-[10px] font-bold uppercase text-text-light">Status</span>
                      <span className="w-7" />
                    </div>

                    {resultRows.map((row, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_0.7fr_0.5fr_0.8fr_0.6fr_auto] gap-2">
                        <input
                          value={row.parameter}
                          onChange={(e) => updateRow(idx, 'parameter', e.target.value)}
                          className="px-2.5 py-2 text-xs rounded-lg border border-gray-200 focus:border-teal focus:ring-1 focus:ring-teal/20 outline-none"
                          placeholder="e.g. Hemoglobin"
                        />
                        <input
                          value={row.value}
                          onChange={(e) => updateRow(idx, 'value', e.target.value)}
                          className="px-2.5 py-2 text-xs rounded-lg border border-gray-200 focus:border-teal focus:ring-1 focus:ring-teal/20 outline-none"
                          placeholder="14.5"
                        />
                        <input
                          value={row.unit}
                          onChange={(e) => updateRow(idx, 'unit', e.target.value)}
                          className="px-2.5 py-2 text-xs rounded-lg border border-gray-200 focus:border-teal focus:ring-1 focus:ring-teal/20 outline-none"
                          placeholder="g/dL"
                        />
                        <input
                          value={row.refRange}
                          onChange={(e) => updateRow(idx, 'refRange', e.target.value)}
                          className="px-2.5 py-2 text-xs rounded-lg border border-gray-200 focus:border-teal focus:ring-1 focus:ring-teal/20 outline-none"
                          placeholder="12-16"
                        />
                        <select
                          value={row.status}
                          onChange={(e) => updateRow(idx, 'status', e.target.value)}
                          className="px-2 py-2 text-xs rounded-lg border border-gray-200 focus:border-teal focus:ring-1 focus:ring-teal/20 outline-none bg-white"
                        >
                          <option value="Normal">Normal</option>
                          <option value="High">High</option>
                          <option value="Low">Low</option>
                          <option value="Abnormal">Abnormal</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeRow(idx)}
                          className="p-1.5 text-text-light hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={resultRows.length <= 1}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Section 2: Remarks ── */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Remarks / Observations</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none resize-none"
                    placeholder="Additional observations..."
                  />
                </div>

                {/* ── Section 3: Lab Notes ── */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Lab Technician Notes</label>
                  <textarea
                    value={labNotes}
                    onChange={(e) => setLabNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none resize-none"
                    placeholder="Internal notes for the doctor..."
                  />
                </div>

                {/* ── Generate PDF Button ── */}
                <button
                  type="button"
                  onClick={handleGeneratePdf}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-navy bg-navy/5 border border-navy/20 rounded-xl hover:bg-navy/10 transition-colors"
                >
                  <FileDown className="w-4 h-4" /> Generate & Download Lab Report PDF
                </button>

                {/* ── File Picker ── */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-2">
                    Attach Report File {uploadFile && <span className="text-teal">(✓ attached)</span>}
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-teal/40 hover:bg-teal/[0.02] transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadFile ? (
                      <div className="flex items-center justify-center gap-2 text-sm text-teal font-medium">
                        <FileText className="w-4 h-4" />
                        {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-6 h-6 text-text-light mx-auto mb-1" />
                        <p className="text-xs text-text-light">Click to browse or drop a file here</p>
                        <p className="text-[10px] text-text-light/60 mt-0.5">PDF, images, or any report file</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setUploadFile(e.target.files[0]);
                    }}
                  />
                </div>

                {/* ── Submit ── */}
                <button
                  type="submit"
                  disabled={uploadSubmitting || !uploadFile}
                  className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadSubmitting ? 'Uploading...' : 'Complete & Upload Report'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

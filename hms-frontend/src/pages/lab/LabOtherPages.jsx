import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSearch, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

export function LabUpload() {
  const [form, setForm] = useState({ labOrderId: '', patientId: '', doctorNotes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a report file to upload');
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append(
        'dto',
        new Blob(
          [JSON.stringify({
            patientId: parseInt(form.patientId),
            doctorNotes: form.doctorNotes,
            isViewedByDoctor: false,
            isViewedByPatient: false,
            labOrderId: parseInt(form.labOrderId),
          })],
          { type: 'application/json' }
        )
      );
      const res = await api.post(`/lab/upload-report/${form.labOrderId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Report uploaded successfully!');
      setResult(res.data);
      setForm({ labOrderId: '', patientId: '', doctorNotes: '' });
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload report');
    }
    setSubmitting(false);
  };

  return (
    <div>
      <PageHeader title="Upload Report" subtitle="Upload lab test results" />
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-lg">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center mb-4 shadow-lg">
          <Upload className="w-7 h-7 text-white" />
        </div>
        <h3 className="font-heading text-lg font-bold text-navy mb-1">Upload Lab Report</h3>
        <p className="text-sm text-text-secondary mb-4">Enter the lab order details and upload the report file.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-text-secondary mb-1">Lab Order ID *</label><input type="number" required min={1} value={form.labOrderId} onChange={e => setForm({...form, labOrderId: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="Order ID" /></div>
            <div><label className="block text-xs font-semibold text-text-secondary mb-1">Patient ID *</label><input type="number" required min={1} value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="Patient ID" /></div>
          </div>

          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Report File *</label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-teal/40 hover:bg-teal/[0.02] transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2 text-sm text-teal font-medium">
                  <FileText className="w-4 h-4" />
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              ) : (
                <div>
                  <Upload className="w-5 h-5 text-text-light mx-auto mb-1" />
                  <p className="text-xs text-text-light">Click to select a report file</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
          </div>

          <div><label className="block text-xs font-semibold text-text-secondary mb-1">Lab Notes</label><textarea value={form.doctorNotes} onChange={e => setForm({...form, doctorNotes: e.target.value})} rows={3} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none resize-none" placeholder="Test results and observations..." /></div>
          <button type="submit" disabled={submitting || !file} className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
            {submitting ? 'Uploading...' : 'Upload Report'}
          </button>
        </form>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-green-700">✅ Report Uploaded Successfully</p>
            <p className="text-xs text-green-600">Report ID: {result.labReportId || '—'}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export function LabReports() {
  const [patientId, setPatientId] = useState('');
  const [searching, setSearching] = useState(false);
  const [reports, setReports] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!patientId.trim()) return;
    setSearching(true);
    setError('');
    setReports(null);
    try {
      const res = await api.get(`/lab/reports/patient/${patientId}?page=0&size=20`);
      setReports(res.data?.content || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch lab reports.');
    }
    setSearching(false);
  };

  return (
    <div>
      <PageHeader title="All Reports" subtitle="Search lab reports by patient" />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <h3 className="font-heading text-sm font-bold text-navy mb-3">Search by Patient ID</h3>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input type="number" required min={1} value={patientId} onChange={e => setPatientId(e.target.value)} className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="Enter Patient ID" />
          <button type="submit" disabled={searching} className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
            {searching ? 'Searching…' : 'Search'}
          </button>
        </form>
        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
      </motion.div>

      {reports !== null && (
        reports.length === 0 ? (
          <EmptyState icon={FileSearch} title="No reports found" message="No lab reports exist for this patient." />
        ) : (
          <div className="space-y-4">
            {reports.map((r, i) => (
              <motion.div
                key={r.labReportId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
                    <FileSearch className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-base font-bold text-navy">Lab Report #{r.labReportId}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-text-secondary">
                      {r.reportFilePath && <span>📄 {r.reportFilePath}</span>}
                      {r.doctorNotes && <span>📝 {r.doctorNotes}</span>}
                      <span>📅 {r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString('en-IN') : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.isViewedByDoctor ? (
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">Dr. Viewed</span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">Pending Dr.</span>
                    )}
                    {r.isViewedByPatient ? (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Pt. Viewed</span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">Pending Pt.</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

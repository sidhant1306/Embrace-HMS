import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Users, Receipt, CheckCircle, Download, X, CreditCard, FileText, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import usePagedData from '../../hooks/usePagedData';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';

/* ═══════════════════ RECEPTIONIST APPOINTMENTS ═══════════════════ */
export function ReceptionistAppointments() {
  const [tab, setTab] = useState('today');
  const todayData = usePagedData('/appointments/today');
  const allData = usePagedData('/appointments/all');
  const { data, page, setPage, totalPages, loading, refresh } = tab === 'today' ? todayData : allData;
  const [acting, setActing] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const handleConfirm = async (id) => {
    setActing(id);
    try { await api.put(`/appointments/confirm-appointment/${id}`); toast.success('Approved'); refresh(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setActing(null);
  };
  const handleComplete = async (id) => {
    setActing(id);
    try { await api.put(`/appointments/complete-appointment/${id}`); toast.success('Completed'); refresh(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setActing(null);
  };
  const handleCancel = async () => {
    if (!cancelReason.trim()) { toast.error('Please enter a reason'); return; }
    setCancelling(true);
    try {
      await api.put(`/appointments/cancel-appointment/${cancelModal}`, { appointmentCancelReason: cancelReason });
      toast.success('Cancelled'); setCancelModal(null); setCancelReason(''); refresh();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setCancelling(false);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Appointments" subtitle="Manage patient appointments" />

      <div className="flex gap-2 mb-6">
        {[{ key: 'today', label: "Today's" }, { key: 'all', label: 'All Appointments' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${tab === t.key ? 'bg-gradient-to-r from-teal to-teal-dark text-white shadow-md' : 'bg-white text-text-secondary border border-gray-200 hover:border-teal/40'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No appointments" message={tab === 'today' ? 'No appointments scheduled for today.' : 'No appointments found.'} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 font-semibold text-text-secondary">Patient</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">Doctor</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">Time</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-text-secondary">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((a) => (
                  <tr key={a.appointmentId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-primary">{a.patientName || '—'}</td>
                    <td className="px-4 py-4 text-text-secondary">{a.doctorName || '—'}</td>
                    <td className="px-4 py-4 text-text-secondary">{a.appointmentDate}</td>
                    <td className="px-4 py-4 text-text-secondary">{a.appointmentTime ? new Date(a.appointmentTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td className="px-4 py-4"><StatusBadge status={a.appointmentStatus} /></td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {(a.appointmentStatus === 'PENDING' || a.appointmentStatus === 'RESCHEDULED') && (
                          <button onClick={() => handleConfirm(a.appointmentId)} disabled={acting === a.appointmentId} className="flex items-center gap-1 text-xs font-semibold text-teal hover:text-teal-dark disabled:opacity-50">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                        )}
                        {a.appointmentStatus === 'APPROVED' && (
                          <button onClick={() => handleComplete(a.appointmentId)} disabled={acting === a.appointmentId} className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50">
                            <CheckCircle className="w-3.5 h-3.5" /> Complete
                          </button>
                        )}
                        {(a.appointmentStatus === 'PENDING' || a.appointmentStatus === 'APPROVED' || a.appointmentStatus === 'RESCHEDULED') && (
                          <button onClick={() => { setCancelModal(a.appointmentId); setCancelReason(''); }} className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600">
                            <Ban className="w-3.5 h-3.5" /> Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 pb-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
        </div>
      )}

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancelModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setCancelModal(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-navy text-lg">Cancel Appointment</h3>
                <button onClick={() => setCancelModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
              </div>
              <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Reason for cancellation…" rows={3} className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none resize-none" />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setCancelModal(null)} className="flex-1 py-2.5 text-sm font-semibold text-text-secondary border border-gray-200 rounded-xl hover:bg-gray-50">Keep</button>
                <button onClick={handleCancel} disabled={cancelling} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50">
                  {cancelling ? 'Cancelling…' : 'Confirm Cancel'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════ RECEPTIONIST PATIENTS ═══════════════════ */
export function ReceptionistPatients() {
  const [patientId, setPatientId] = useState('');
  const [searching, setSearching] = useState(false);
  const [appointments, setAppointments] = useState(null);
  const [bills, setBills] = useState(null);
  const [prescriptions, setPrescriptions] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!patientId.trim()) return;
    setSearching(true);
    setError('');
    setAppointments(null);
    setBills(null);
    setPrescriptions(null);
    try {
      const [apptRes, billRes, rxRes] = await Promise.allSettled([
        api.get(`/appointments/patient/${patientId}?page=0&size=10`),
        api.get(`/bills/patient/${patientId}?page=0&size=10`),
        api.get(`/prescriptions/patient/${patientId}?page=0&size=10`),
      ]);
      if (apptRes.status === 'fulfilled') setAppointments(apptRes.value.data?.content || []);
      if (billRes.status === 'fulfilled') setBills(billRes.value.data?.content || []);
      if (rxRes.status === 'fulfilled') setPrescriptions(rxRes.value.data?.content || []);
      if (apptRes.status === 'rejected' && billRes.status === 'rejected' && rxRes.status === 'rejected') {
        setError('Patient not found or no records available.');
      }
    } catch {
      setError('Failed to fetch patient data.');
    }
    setSearching(false);
  };

  const fmt = (v) => v != null ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—';

  return (
    <div>
      <PageHeader title="Patients" subtitle="Search and view patient records" />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <h3 className="font-heading text-sm font-bold text-navy mb-3">Look Up Patient</h3>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input type="number" required min={1} value={patientId} onChange={e => setPatientId(e.target.value)} className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="Enter Patient ID" />
          <button type="submit" disabled={searching} className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
            {searching ? 'Searching…' : 'Search'}
          </button>
        </form>
        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
      </motion.div>

      {appointments !== null && (
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-heading font-bold text-navy flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Appointments ({appointments.length})</h3></div>
            {appointments.length === 0 ? (
              <div className="py-8 text-center text-sm text-text-secondary">No appointments found.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {appointments.map(a => (
                  <div key={a.appointmentId} className="px-6 py-3 flex items-center gap-4 hover:bg-gray-50/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{a.doctorName || 'Doctor'}</p>
                      <p className="text-xs text-text-light">{a.appointmentDate} {a.appointmentTime ? `at ${new Date(a.appointmentTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}</p>
                    </div>
                    <StatusBadge status={a.appointmentStatus} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {bills !== null && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-heading font-bold text-navy flex items-center gap-2"><Receipt className="w-4 h-4" /> Bills ({bills.length})</h3></div>
              {bills.length === 0 ? (
                <div className="py-8 text-center text-sm text-text-secondary">No bills found.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {bills.map(b => (
                    <div key={b.billId} className="px-6 py-3 flex items-center gap-4 hover:bg-gray-50/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary">Bill #{b.billId}</p>
                        <p className="text-xs text-text-light">Total: {fmt(b.totalAmount)} | Paid: {fmt(b.amountPaid)} | Due: {fmt(b.balanceDue)}</p>
                      </div>
                      <StatusBadge status={b.paymentStatuses} />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {prescriptions !== null && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-heading font-bold text-navy flex items-center gap-2"><FileText className="w-4 h-4" /> Prescriptions ({prescriptions.length})</h3></div>
              {prescriptions.length === 0 ? (
                <div className="py-8 text-center text-sm text-text-secondary">No prescriptions found.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {prescriptions.map(rx => (
                    <div key={rx.prescriptionId} className="px-6 py-3 hover:bg-gray-50/50">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-sm font-medium text-text-primary">#{rx.prescriptionNumber || rx.prescriptionId}</p>
                        <StatusBadge status={rx.prescriptionStatus} />
                      </div>
                      {rx.prescriptionItems?.length > 0 && (
                        <p className="text-xs text-text-light">{rx.prescriptionItems.map(item => item.medicineName).join(', ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ RECEPTIONIST BILLING ═══════════════════ */
export function ReceptionistBilling() {
  const { data, page, setPage, totalPages, loading, refresh } = usePagedData('/bills/pending');
  const [payModal, setPayModal] = useState(null);
  const [payForm, setPayForm] = useState({ paymentAmount: '', paymentMethod: 'CASH' });
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [genId, setGenId] = useState('');
  const [genSubmitting, setGenSubmitting] = useState(false);

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    setGenSubmitting(true);
    try {
      await api.post('/bills/generate', { consultationId: parseInt(genId) });
      toast.success('Bill generated!');
      setGenId('');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate bill');
    }
    setGenSubmitting(false);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaySubmitting(true);
    try {
      await api.post(`/bills/${payModal.billId}/payments`, {
        paymentAmount: parseFloat(payForm.paymentAmount),
        paymentMethod: payForm.paymentMethod,
      });
      toast.success('Payment recorded!');
      setPayModal(null);
      setPayForm({ paymentAmount: '', paymentMethod: 'CASH' });
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    }
    setPaySubmitting(false);
  };

  const handleDownloadPdf = async (billId) => {
    try {
      const res = await api.get(`/bills/${billId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bill-${billId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Failed to download PDF'); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Billing" subtitle="Manage bills and payments" />

      {/* Generate Bill Quick Form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <h3 className="font-heading text-sm font-bold text-navy mb-3">Generate New Bill</h3>
        <form onSubmit={handleGenerateBill} className="flex gap-3">
          <input type="number" required min={1} value={genId} onChange={e => setGenId(e.target.value)} className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="Consultation ID" />
          <button type="submit" disabled={genSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
            {genSubmitting ? 'Generating...' : 'Generate Bill'}
          </button>
        </form>
      </motion.div>

      {/* Pending Bills List */}
      {data.length === 0 ? (
        <EmptyState icon={Receipt} title="No pending bills" message="All bills have been settled." />
      ) : (
        <div className="space-y-4">
          {data.map((bill, i) => (
            <motion.div key={bill.billId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-heading text-base font-bold text-navy">Bill #{bill.billId}</h3>
                    <StatusBadge status={bill.paymentStatuses} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mt-2">
                    <div><span className="text-text-light">Total:</span> <span className="font-bold text-text-primary">₹{bill.totalAmount?.toFixed(2)}</span></div>
                    <div><span className="text-text-light">Paid:</span> <span className="font-medium text-green-600">₹{bill.amountPaid?.toFixed(2)}</span></div>
                    <div><span className="text-text-light">Due:</span> <span className="font-bold text-red-500">₹{bill.balanceDue?.toFixed(2)}</span></div>
                    <div><span className="text-text-light">Patient:</span> <span className="font-medium">{bill.patientId}</span></div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {bill.balanceDue > 0 && (
                    <button onClick={() => { setPayModal(bill); setPayForm({ paymentAmount: bill.balanceDue.toString(), paymentMethod: 'CASH' }); }} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-green-600 border border-green-200 rounded-xl hover:bg-green-50 transition-colors">
                      <CreditCard className="w-3.5 h-3.5" /> Pay
                    </button>
                  )}
                  <button onClick={() => handleDownloadPdf(bill.billId)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-teal border border-teal/30 rounded-xl hover:bg-teal/5 transition-colors">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Payment Modal */}
      <AnimatePresence>
        {payModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setPayModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div><h2 className="font-heading text-lg font-bold text-navy">Record Payment</h2><p className="text-sm text-text-secondary">Bill #{payModal.billId} — Balance: ₹{payModal.balanceDue?.toFixed(2)}</p></div>
                <button onClick={() => setPayModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-text-secondary" /></button>
              </div>
              <form onSubmit={handlePayment} className="p-6 space-y-4">
                <div><label className="block text-xs font-semibold text-text-secondary mb-1">Amount *</label><input type="number" step="0.01" required min={0.01} value={payForm.paymentAmount} onChange={e => setPayForm({...payForm, paymentAmount: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" /></div>
                <div><label className="block text-xs font-semibold text-text-secondary mb-1">Payment Method *</label>
                  <select value={payForm.paymentMethod} onChange={e => setPayForm({...payForm, paymentMethod: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none">
                    <option value="CASH">Cash</option><option value="CARD">Card</option><option value="UPI">UPI</option><option value="NET_BANKING">Net Banking</option><option value="INSURANCE">Insurance</option>
                  </select>
                </div>
                <button type="submit" disabled={paySubmitting} className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                  {paySubmitting ? 'Processing...' : 'Record Payment'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

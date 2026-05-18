import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Stethoscope, UserCog, BarChart3, Plus, X, Eye, Phone, Mail, MapPin, Clock, CalendarDays, Receipt, FileText, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';

/* ═══════════════════ ADMIN PATIENTS ═══════════════════ */
export function AdminPatients() {
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

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <h3 className="font-heading text-sm font-bold text-navy mb-3">Look Up Patient</h3>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="number"
            required
            min={1}
            value={patientId}
            onChange={e => setPatientId(e.target.value)}
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none"
            placeholder="Enter Patient ID"
          />
          <button type="submit" disabled={searching} className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
            {searching ? 'Searching…' : 'Search'}
          </button>
        </form>
        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
      </motion.div>

      {/* Results */}
      {appointments !== null && (
        <div className="space-y-6">
          {/* Appointments */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-heading font-bold text-navy flex items-center gap-2">
                <CalendarDays className="w-4 h-4" /> Appointments ({appointments.length})
              </h3>
            </div>
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

          {/* Bills */}
          {bills !== null && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-heading font-bold text-navy flex items-center gap-2">
                  <Receipt className="w-4 h-4" /> Bills ({bills.length})
                </h3>
              </div>
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

          {/* Prescriptions */}
          {prescriptions !== null && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-heading font-bold text-navy flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Prescriptions ({prescriptions.length})
                </h3>
              </div>
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
                        <p className="text-xs text-text-light">
                          {rx.prescriptionItems.map(item => item.medicineName).join(', ')}
                        </p>
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

/* ═══════════════════ ADMIN DOCTORS ═══════════════════ */
export function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', gender: 'MALE', specialization: '', room: '', workingHours: '' });

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/register-doctor', form);
      toast.success('Doctor registered successfully!');
      setShowForm(false);
      setForm({ name: '', email: '', password: '', phone: '', gender: 'MALE', specialization: '', room: '', workingHours: '' });
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to register doctor');
    }
    setSubmitting(false);
  };

  const handleRemove = async () => {
    if (!confirmRemove) return;
    setRemoving(true);
    try {
      // we need the userId — fetch staff list to find it, or use a lookup
      const staffRes = await api.get(`/admin/all-staff?role=DOCTOR&size=100`);
      const match = staffRes.data?.content?.find(s => s.doctorId === confirmRemove.doctorId);
      if (match) {
        await api.delete(`/admin/remove-staff/${match.userId}`);
        toast.success(`${confirmRemove.doctorName} has been removed.`);
        fetchDoctors();
      } else {
        toast.error('Could not find user ID for this doctor.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || 'Failed to remove doctor');
    }
    setRemoving(false);
    setConfirmRemove(null);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Doctors" subtitle="Register and manage doctor profiles" />
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-xl shadow-md hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      {doctors.length === 0 ? (
        <EmptyState icon={Stethoscope} title="No doctors" message="No doctors have been registered yet. Click 'Add Doctor' to register one." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((d, i) => (
            <motion.div key={d.doctorId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                  <span className="text-white font-heading text-sm font-bold">{d.doctorName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading text-base font-bold text-navy truncate">{d.doctorName}</h3>
                  <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold uppercase bg-teal/10 text-teal rounded-md">{d.doctorSpecialization}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm text-text-secondary">
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-text-light" /><span className="truncate">{d.userEmail}</span></div>
                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-text-light" /><span>{d.doctorPhone || '—'}</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-text-light" /><span>{d.doctorRoom || '—'}</span></div>
                <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-text-light" /><span>{d.doctorWorkingHours || '—'}</span></div>
              </div>
              <button onClick={() => setConfirmRemove(d)} className="mt-4 w-full py-2 text-xs font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" /> Remove Doctor
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Register Doctor Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-heading text-lg font-bold text-navy">Register New Doctor</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-text-secondary" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-text-secondary mb-1">Full Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="Dr. John Doe" /></div>
                  <div><label className="block text-xs font-semibold text-text-secondary mb-1">Email *</label><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="doctor@embrace.com" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-text-secondary mb-1">Password *</label><input type="password" required minLength={8} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="Min 8 characters" /></div>
                  <div><label className="block text-xs font-semibold text-text-secondary mb-1">Phone *</label><input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="9876543210" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-text-secondary mb-1">Gender *</label>
                    <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none">
                      <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div><label className="block text-xs font-semibold text-text-secondary mb-1">Specialization *</label><input required value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="Cardiology" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-text-secondary mb-1">Room *</label><input required value={form.room} onChange={e => setForm({...form, room: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="Room 201, Block A" /></div>
                  <div><label className="block text-xs font-semibold text-text-secondary mb-1">Working Hours *</label><input required value={form.workingHours} onChange={e => setForm({...form, workingHours: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="Mon-Sat: 9AM-5PM" /></div>
                </div>
                <button type="submit" disabled={submitting} className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                  {submitting ? 'Registering...' : 'Register Doctor'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Remove Modal */}
      <AnimatePresence>
        {confirmRemove && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setConfirmRemove(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-500" /></div>
              <h3 className="font-heading text-lg font-bold text-navy mb-2">Remove Doctor?</h3>
              <p className="text-sm text-text-secondary mb-6">Are you sure you want to remove <strong>{confirmRemove.doctorName}</strong>? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmRemove(null)} className="flex-1 py-2.5 text-sm font-semibold text-text-secondary border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                <button onClick={handleRemove} disabled={removing} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50">{removing ? 'Removing...' : 'Remove'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════ ADMIN STAFF ═══════════════════ */
const STAFF_ROLES = ['ALL', 'ADMIN', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN', 'NURSE'];
const ROLE_LABELS_MAP = { ALL: 'All Staff', ADMIN: 'Admins', RECEPTIONIST: 'Receptionists', PHARMACIST: 'Pharmacists', LAB_TECHNICIAN: 'Lab Techs', NURSE: 'Nurses' };
const ROLE_COLORS = { ADMIN: 'bg-violet-50 text-violet-700', RECEPTIONIST: 'bg-blue-50 text-blue-700', PHARMACIST: 'bg-emerald-50 text-emerald-700', LAB_TECHNICIAN: 'bg-amber-50 text-amber-700', NURSE: 'bg-pink-50 text-pink-700', DOCTOR: 'bg-teal/10 text-teal', SUPER_ADMIN: 'bg-red-50 text-red-700' };

export function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [form, setForm] = useState({ userName: '', userEmail: '', userPassword: '', userPhone: '', userGender: 'MALE', userRole: 'RECEPTIONIST' });

  const fetchStaff = async (roleFilter = activeRole, pageNum = page, search = searchQuery) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pageNum, size: 12, sort: 'userName,asc' });
      if (roleFilter && roleFilter !== 'ALL') params.set('role', roleFilter);
      if (search.trim()) params.set('search', search.trim());
      const res = await api.get(`/admin/all-staff?${params}`);
      setStaff(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
    } catch { setStaff([]); }
    setLoading(false);
  };

  useEffect(() => { fetchStaff(); }, [activeRole, page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(0); fetchStaff(activeRole, 0, searchQuery); };
  const handleRoleFilter = (role) => { setActiveRole(role); setPage(0); setSearchQuery(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/register-staff', form);
      toast.success('Staff member registered successfully!');
      setShowForm(false);
      setForm({ userName: '', userEmail: '', userPassword: '', userPhone: '', userGender: 'MALE', userRole: 'RECEPTIONIST' });
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to register staff');
    }
    setSubmitting(false);
  };

  const handleRemove = async () => {
    if (!confirmRemove) return;
    setRemoving(true);
    try {
      await api.delete(`/admin/remove-staff/${confirmRemove.userId}`);
      toast.success(`${confirmRemove.userName} has been removed.`);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || 'Failed to remove staff member');
    }
    setRemoving(false);
    setConfirmRemove(null);
  };

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';
  const GRADIENT_MAP = { ADMIN: 'from-violet-500 to-purple-600', RECEPTIONIST: 'from-blue-500 to-blue-600', PHARMACIST: 'from-emerald-500 to-green-600', LAB_TECHNICIAN: 'from-amber-500 to-orange-600', NURSE: 'from-pink-500 to-rose-600', SUPER_ADMIN: 'from-red-500 to-rose-600' };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <PageHeader title="Staff Management" subtitle="Register, view, and manage hospital staff" />
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-md hover:shadow-lg transition-all shrink-0">
          <Plus className="w-4 h-4" /> Register Staff
        </button>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {STAFF_ROLES.map(role => (
          <button key={role} onClick={() => handleRoleFilter(role)} className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${activeRole === role ? 'bg-navy text-white shadow-md' : 'bg-white text-text-secondary border border-gray-200 hover:bg-gray-50'}`}>
            {ROLE_LABELS_MAP[role]}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name..." className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" />
        </div>
      </form>

      {/* Staff Grid */}
      {loading ? <Spinner /> : staff.length === 0 ? (
        <EmptyState icon={UserCog} title="No staff found" message={searchQuery ? 'No staff members match your search.' : 'No staff members registered yet. Click "Register Staff" to add one.'} />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((s, i) => (
              <motion.div key={s.userId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${GRADIENT_MAP[s.userRole] || 'from-gray-400 to-gray-500'} flex items-center justify-center shrink-0`}>
                    <span className="text-white font-heading text-xs font-bold">{initials(s.userName)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-sm font-bold text-navy truncate">{s.userName}</h3>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${ROLE_COLORS[s.userRole] || 'bg-gray-100 text-gray-600'}`}>{s.userRole?.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-text-secondary">
                  <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-text-light" /><span className="truncate text-xs">{s.userEmail}</span></div>
                  <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-text-light" /><span className="text-xs">{s.userPhone || '—'}</span></div>
                </div>
                <button onClick={() => setConfirmRemove(s)} className="mt-3 w-full py-2 text-xs font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </motion.div>
            ))}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)} className={`w-9 h-9 text-xs font-semibold rounded-xl transition-all ${page === i ? 'bg-navy text-white shadow-md' : 'bg-white text-text-secondary border border-gray-200 hover:bg-gray-50'}`}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Register Staff Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-heading text-lg font-bold text-navy">Register New Staff</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-text-secondary" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div><label className="block text-xs font-semibold text-text-secondary mb-1">Role *</label>
                  <select value={form.userRole} onChange={e => setForm({...form, userRole: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none">
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="PHARMACIST">Pharmacist</option>
                    <option value="LAB_TECHNICIAN">Lab Technician</option>
                    <option value="NURSE">Nurse</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-text-secondary mb-1">Full Name *</label><input required value={form.userName} onChange={e => setForm({...form, userName: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="Full Name" /></div>
                  <div><label className="block text-xs font-semibold text-text-secondary mb-1">Email *</label><input type="email" required value={form.userEmail} onChange={e => setForm({...form, userEmail: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="staff@embrace.com" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-text-secondary mb-1">Password *</label><input type="password" required minLength={8} value={form.userPassword} onChange={e => setForm({...form, userPassword: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="Min 8 characters" /></div>
                  <div><label className="block text-xs font-semibold text-text-secondary mb-1">Phone *</label><input required value={form.userPhone} onChange={e => setForm({...form, userPhone: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none" placeholder="9876543210" /></div>
                </div>
                <div><label className="block text-xs font-semibold text-text-secondary mb-1">Gender *</label>
                  <select value={form.userGender} onChange={e => setForm({...form, userGender: e.target.value})} className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none">
                    <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
                  </select>
                </div>
                <button type="submit" disabled={submitting} className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                  {submitting ? 'Registering...' : 'Register Staff Member'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Remove Modal */}
      <AnimatePresence>
        {confirmRemove && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setConfirmRemove(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-500" /></div>
              <h3 className="font-heading text-lg font-bold text-navy mb-2">Remove Staff Member?</h3>
              <p className="text-sm text-text-secondary mb-6">Are you sure you want to remove <strong>{confirmRemove.userName}</strong> ({confirmRemove.userRole?.replace('_', ' ')})? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmRemove(null)} className="flex-1 py-2.5 text-sm font-semibold text-text-secondary border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                <button onClick={handleRemove} disabled={removing} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50">{removing ? 'Removing...' : 'Remove'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════ ADMIN REPORTS ═══════════════════ */
export function AdminReports() {
  return (
    <div>
      <PageHeader title="Reports" subtitle="Hospital analytics and reports" />
      <EmptyState icon={BarChart3} title="Reports & Analytics" message="Analytics dashboards will be available as data accumulates in the system." />
    </div>
  );
}

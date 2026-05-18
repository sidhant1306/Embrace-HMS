import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, MapPin, Droplets, AlertCircle, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';

const BLOOD_GROUPS = ['A_PLUS', 'A_MINUS', 'B_PLUS', 'B_MINUS', 'O_PLUS', 'O_MINUS', 'AB_PLUS', 'AB_MINUS'];
const bloodLabel = (v) => v?.replace('_PLUS', '+').replace('_MINUS', '-') || '';

export default function PatientProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ patientAddress: '', emergencyContact: '', bloodGroup: '' });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/patients/view-own-details');
        setProfile(res.data);
        setForm({
          patientAddress: res.data.patientAddress || '',
          emergencyContact: res.data.patientEmergencyContact || '',
          bloodGroup: res.data.patientBloodGroup || '',
        });
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await api.put(`/patients/update-own-profile/${profile.patientId}`, form);
      setProfile(res.data);
      toast.success('Profile updated');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    }
    setSaving(false);
  };

  if (loading) return <Spinner />;
  if (!profile) return <div className="py-20 text-center text-text-secondary">Could not load profile.</div>;

  return (
    <div>
      <PageHeader title="My Profile" subtitle="View and update your personal details" />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-navy to-navy-light flex items-center justify-center mb-4 shadow-lg">
              <span className="text-white font-heading text-2xl font-bold">
                {profile.patientName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <h2 className="font-heading text-xl font-bold text-navy">{profile.patientName}</h2>
            <p className="text-sm text-text-secondary mt-1">Patient ID: #{profile.patientId}</p>
          </div>

          <div className="mt-6 space-y-3">
            <InfoRow icon={Mail} label="Email" value={profile.patientEmail} />
            <InfoRow icon={Phone} label="Phone" value={profile.patientPhone} />
            <InfoRow icon={User} label="Gender" value={profile.patientGender} />
            <InfoRow icon={User} label="Age" value={profile.patientAge} />
            <InfoRow icon={Droplets} label="Blood Group" value={bloodLabel(profile.patientBloodGroup)} />
            <InfoRow icon={MapPin} label="Address" value={profile.patientAddress || '—'} />
            <InfoRow icon={AlertCircle} label="Emergency Contact" value={profile.patientEmergencyContact || '—'} />
          </div>
        </motion.div>

        {/* Edit Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-heading text-lg font-bold text-navy mb-6">Update Details</h3>
          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-navy mb-2 block">Address</label>
              <textarea value={form.patientAddress} onChange={(e) => setForm(f => ({ ...f, patientAddress: e.target.value }))} rows={3} className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none resize-none" placeholder="Enter your address" />
            </div>
            <div>
              <label className="text-sm font-semibold text-navy mb-2 block">Emergency Contact</label>
              <input type="tel" value={form.emergencyContact} onChange={(e) => setForm(f => ({ ...f, emergencyContact: e.target.value }))} className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="text-sm font-semibold text-navy mb-2 block">Blood Group</label>
              <div className="flex flex-wrap gap-2">
                {BLOOD_GROUPS.map(bg => (
                  <button key={bg} type="button" onClick={() => setForm(f => ({ ...f, bloodGroup: bg }))} className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all ${form.bloodGroup === bg ? 'bg-teal text-white border-teal shadow-md' : 'border-gray-200 text-text-secondary hover:border-teal/40'}`}>
                    {bloodLabel(bg)}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-xl shadow-lg shadow-teal/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-navy/50" /></div>
      <div className="min-w-0"><p className="text-[11px] text-text-light uppercase">{label}</p><p className="text-sm font-medium text-text-primary truncate">{value || '—'}</p></div>
    </div>
  );
}

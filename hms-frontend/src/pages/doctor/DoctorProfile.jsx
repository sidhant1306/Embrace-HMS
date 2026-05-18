import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Stethoscope, MapPin, Clock } from 'lucide-react';
import api from '../../api/axios';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';

export default function DoctorProfile() {
  const { userName } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/doctors/view-own-profile');
        setProfile(res.data);
      } catch { /* fallback to basic info from auth */ }
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;

  const displayName = profile?.doctorName || userName || 'Doctor';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Your professional information" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-2xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-navy to-navy-light flex items-center justify-center shadow-lg">
            <span className="text-white font-heading text-2xl font-bold">{initials}</span>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-navy">{displayName}</h2>
            <span className="inline-block mt-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase rounded-lg">Doctor</span>
          </div>
        </div>
        <div className="space-y-4">
          <InfoRow icon={User} label="Full Name" value={displayName} />
          <InfoRow icon={Mail} label="Email" value={profile?.userEmail} />
          <InfoRow icon={Phone} label="Phone" value={profile?.doctorPhone} />
          <InfoRow icon={Stethoscope} label="Specialization" value={profile?.doctorSpecialization} />
          <InfoRow icon={MapPin} label="Room" value={profile?.doctorRoom} />
          <InfoRow icon={Clock} label="Working Hours" value={profile?.doctorWorkingHours} />
        </div>
        <p className="text-sm text-text-light mt-6">Contact your administrator to update profile details.</p>
      </motion.div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-navy/50" /></div>
      <div><p className="text-[11px] text-text-light uppercase">{label}</p><p className="text-sm font-medium text-text-primary">{value || '—'}</p></div>
    </div>
  );
}

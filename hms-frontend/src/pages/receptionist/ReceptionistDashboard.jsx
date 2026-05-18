import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Users, Receipt, ArrowRight, Stethoscope, Clock } from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';

export default function ReceptionistDashboard() {
  const { userName } = useAuth();
  const [stats, setStats] = useState({ todayAppts: 0, pendingBills: 0, activeAdmissions: 0 });
  const [recentAppts, setRecentAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [apptsRes, billsRes, admissionsRes] = await Promise.allSettled([
          api.get('/appointments/today?page=0&size=5'),
          api.get('/bills/pending?page=0&size=1'),
          api.get('/admissions/active?page=0&size=1'),
        ]);
        setStats({
          todayAppts: apptsRes.status === 'fulfilled' ? (apptsRes.value.data?.totalElements || 0) : 0,
          pendingBills: billsRes.status === 'fulfilled' ? (billsRes.value.data?.totalElements || 0) : 0,
          activeAdmissions: admissionsRes.status === 'fulfilled' ? (admissionsRes.value.data?.totalElements || 0) : 0,
        });
        if (apptsRes.status === 'fulfilled') setRecentAppts(apptsRes.value.data?.content || []);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl lg:text-3xl font-bold text-navy">Receptionist Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">Welcome, {userName}. Manage front-desk operations.</p>
      </motion.div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={CalendarDays} label="Today's Appointments" value={stats.todayAppts} gradient="from-blue-500 to-blue-600" delay={0.1} />
        <StatCard icon={Receipt} label="Pending Bills" value={stats.pendingBills} gradient="from-amber-500 to-orange-600" delay={0.15} />
        <StatCard icon={Users} label="Active Admissions" value={stats.activeAdmissions} gradient="from-teal to-teal-dark" delay={0.2} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-heading font-bold text-navy">Today's Schedule</h2>
          <Link to="/receptionist/appointments" className="text-sm font-semibold text-teal hover:text-teal-dark flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
        </div>
        {recentAppts.length === 0 ? (
          <div className="py-12 text-center"><CalendarDays className="w-10 h-10 text-text-light/30 mx-auto mb-3" /><p className="text-sm text-text-secondary">No appointments today.</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentAppts.map((a) => (
              <div key={a.appointmentId} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"><Stethoscope className="w-5 h-5 text-blue-500" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{a.patientName || 'Patient'} → {a.doctorName || 'Doctor'}</p>
                  <div className="flex items-center gap-2 mt-0.5"><Clock className="w-3 h-3 text-text-light" /><span className="text-xs text-text-light">{a.appointmentTime ? new Date(a.appointmentTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</span></div>
                </div>
                <StatusBadge status={a.appointmentStatus} />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

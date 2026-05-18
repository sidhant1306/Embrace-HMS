import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, FileText, FlaskConical, Receipt, CalendarPlus, Clock, Stethoscope, ArrowRight } from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';

export default function PatientDashboard() {
  const { userName } = useAuth();
  const [stats, setStats] = useState({ appointments: 0, prescriptions: 0, labReports: 0, bills: 0 });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [apptRes, rxRes, labRes, billRes] = await Promise.allSettled([
          api.get('/patients/view-own-appointment?page=0&size=5'),
          api.get('/patients/view-own-prescriptions?page=0&size=1'),
          api.get('/patients/view-own-lab-reports?page=0&size=1'),
          api.get('/patients/view-own-bills?page=0&size=1'),
        ]);
        const appts = apptRes.status === 'fulfilled' ? apptRes.value.data : { content: [], totalElements: 0 };
        setStats({
          appointments: appts.totalElements || 0,
          prescriptions: rxRes.status === 'fulfilled' ? rxRes.value.data.totalElements || 0 : 0,
          labReports: labRes.status === 'fulfilled' ? labRes.value.data.totalElements || 0 : 0,
          bills: billRes.status === 'fulfilled' ? billRes.value.data.totalElements || 0 : 0,
        });
        setRecentAppointments(appts.content || []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <Spinner />;

  const firstName = userName?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl lg:text-3xl font-bold text-navy">
          Welcome back, <span className="bg-gradient-to-r from-teal to-teal-dark bg-clip-text text-transparent">{firstName}</span> 👋
        </h1>
        <p className="text-text-secondary text-sm mt-1">Here's an overview of your health journey at Embrace Hospital.</p>
      </motion.div>

      {/* Quick Action */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Link
          to="/patient/book-appointment"
          className="group flex items-center gap-4 bg-gradient-to-r from-teal to-teal-dark rounded-2xl p-5 shadow-lg shadow-teal/15 hover:shadow-xl hover:shadow-teal/25 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <CalendarPlus className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-heading font-bold text-white text-lg">Book an Appointment</p>
            <p className="text-white/70 text-sm">Schedule a visit with our specialist doctors</p>
          </div>
          <ArrowRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarDays} label="Appointments" value={stats.appointments} gradient="from-blue-500 to-blue-600" delay={0.15} />
        <StatCard icon={FileText} label="Prescriptions" value={stats.prescriptions} gradient="from-violet-500 to-purple-600" delay={0.2} />
        <StatCard icon={FlaskConical} label="Lab Reports" value={stats.labReports} gradient="from-cyan-500 to-teal" delay={0.25} />
        <StatCard icon={Receipt} label="Bills" value={stats.bills} gradient="from-amber-500 to-orange-600" delay={0.3} />
      </div>

      {/* Recent Appointments */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-heading font-bold text-navy">Recent Appointments</h2>
          <Link to="/patient/appointments" className="text-sm font-semibold text-teal hover:text-teal-dark transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recentAppointments.length === 0 ? (
          <div className="py-12 text-center">
            <CalendarDays className="w-10 h-10 text-text-light/30 mx-auto mb-3" />
            <p className="text-sm text-text-secondary">No appointments yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentAppointments.map((a) => (
              <div key={a.appointmentId} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-5 h-5 text-navy/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{a.doctorName || 'Doctor'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3 text-text-light" />
                    <span className="text-xs text-text-light">
                      {a.appointmentDate} {a.appointmentTime ? `at ${new Date(a.appointmentTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}
                    </span>
                  </div>
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

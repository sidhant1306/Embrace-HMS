import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Stethoscope, FileText, ClipboardList, ArrowRight, Clock } from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';

export default function DoctorDashboard() {
  const { userName } = useAuth();
  const [todayAppts, setTodayAppts] = useState([]);
  const [totalToday, setTotalToday] = useState(0);
  const [consultCount, setConsultCount] = useState(0);
  const [prescriptionCount, setPrescriptionCount] = useState(0);
  const [labOrderCount, setLabOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [apptsRes, consultRes, rxRes, labRes] = await Promise.allSettled([
          api.get('/appointments/today?page=0&size=10'),
          api.get('/consultations/my?page=0&size=1'),
          api.get('/prescriptions/my?page=0&size=1'),
          api.get('/lab/pending-orders?page=0&size=1'),
        ]);
        if (apptsRes.status === 'fulfilled') {
          setTodayAppts(apptsRes.value.data.content || []);
          setTotalToday(apptsRes.value.data.totalElements || 0);
        }
        if (consultRes.status === 'fulfilled') {
          setConsultCount(consultRes.value.data.totalElements || 0);
        }
        if (rxRes.status === 'fulfilled') {
          setPrescriptionCount(rxRes.value.data.totalElements || 0);
        }
        if (labRes.status === 'fulfilled') {
          setLabOrderCount(labRes.value.data.totalElements || 0);
        }
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;
  const firstName = userName?.split(' ')[0] || 'Doctor';

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl lg:text-3xl font-bold text-navy">Good day, <span className="bg-gradient-to-r from-teal to-teal-dark bg-clip-text text-transparent">Dr. {firstName}</span> 🩺</h1>
        <p className="text-text-secondary text-sm mt-1">Here's your schedule for today.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarDays} label="Today's Appointments" value={totalToday} gradient="from-blue-500 to-blue-600" delay={0.1} />
        <StatCard icon={Stethoscope} label="Total Consultations" value={consultCount} gradient="from-violet-500 to-purple-600" delay={0.15} />
        <StatCard icon={FileText} label="Prescriptions" value={prescriptionCount} gradient="from-teal to-teal-dark" delay={0.2} />
        <StatCard icon={ClipboardList} label="Lab Orders" value={labOrderCount} gradient="from-amber-500 to-orange-600" delay={0.25} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-heading font-bold text-navy">Today's Schedule</h2>
          <Link to="/doctor/today-appointments" className="text-sm font-semibold text-teal hover:text-teal-dark flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
        </div>
        {todayAppts.length === 0 ? (
          <div className="py-12 text-center"><CalendarDays className="w-10 h-10 text-text-light/30 mx-auto mb-3" /><p className="text-sm text-text-secondary">No appointments today.</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {todayAppts.map((a) => (
              <div key={a.appointmentId} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-5 h-5 text-teal" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{a.patientName || 'Patient'}</p>
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

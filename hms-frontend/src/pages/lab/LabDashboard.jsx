import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Upload, FileSearch } from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';

export default function LabDashboard() {
  const { userName } = useAuth();
  const [stats, setStats] = useState({ pending: 0, uploaded: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [pendingRes, reportsRes] = await Promise.allSettled([
          api.get('/lab/pending-orders?page=0&size=1'),
          api.get('/lab/all-reports?page=0&size=1'),
        ]);
        const pending = pendingRes.status === 'fulfilled' ? (pendingRes.value.data?.totalElements || 0) : 0;
        const total = reportsRes.status === 'fulfilled' ? (reportsRes.value.data?.totalElements || 0) : 0;
        setStats({ pending, uploaded: total, total });
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl lg:text-3xl font-bold text-navy">Lab Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">Welcome, {userName}. Manage lab orders and reports.</p>
      </motion.div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={ClipboardList} label="Pending Orders" value={stats.pending} gradient="from-amber-500 to-orange-600" delay={0.1} />
        <StatCard icon={Upload} label="Reports Uploaded" value={stats.uploaded} gradient="from-teal to-teal-dark" delay={0.15} />
        <StatCard icon={FileSearch} label="Total Reports" value={stats.total} gradient="from-cyan-500 to-blue-600" delay={0.2} />
      </div>
    </div>
  );
}

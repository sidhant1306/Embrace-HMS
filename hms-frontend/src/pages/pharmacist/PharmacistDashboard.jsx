import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Pill, Package } from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';

export default function PharmacistDashboard() {
  const { userName } = useAuth();
  const [stats, setStats] = useState({ pending: 0, lowStock: 0, totalMeds: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [pendingRes, lowStockRes, allMedsRes] = await Promise.allSettled([
          api.get('/pharmacy/get-pending-dispenses?page=0&size=1'),
          api.get('/pharmacy/get-low-stock?page=0&size=1'),
          api.get('/pharmacy/get-all-medicine?page=0&size=1'),
        ]);
        setStats({
          pending: pendingRes.status === 'fulfilled' ? (pendingRes.value.data?.totalElements || 0) : 0,
          lowStock: lowStockRes.status === 'fulfilled' ? (lowStockRes.value.data?.totalElements || 0) : 0,
          totalMeds: allMedsRes.status === 'fulfilled' ? (allMedsRes.value.data?.totalElements || 0) : 0,
        });
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl lg:text-3xl font-bold text-navy">Pharmacist Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">Welcome, {userName}. Manage prescriptions and inventory.</p>
      </motion.div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={ClipboardList} label="Pending Rx" value={stats.pending} gradient="from-amber-500 to-orange-600" delay={0.1} />
        <StatCard icon={Package} label="Low Stock" value={stats.lowStock} gradient="from-red-500 to-rose-600" delay={0.15} />
        <StatCard icon={Pill} label="Total Medicines" value={stats.totalMeds} gradient="from-teal to-teal-dark" delay={0.2} />
      </div>
    </div>
  );
}

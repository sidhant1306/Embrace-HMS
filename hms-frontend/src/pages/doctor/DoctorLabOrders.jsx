import { ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import usePagedData from '../../hooks/usePagedData';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';

export default function DoctorLabOrders() {
  const { data, page, setPage, totalPages, loading } = usePagedData('/lab/pending-orders');

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Lab Orders" subtitle="Track lab test orders for your patients" />
      {data.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No lab orders" message="No pending lab orders found." />
      ) : (
        <div className="space-y-4">
          {data.map((o, i) => (
            <motion.div key={o.labOrderId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-heading text-base font-bold text-navy">{o.labOrderTestName}</h3>
                    <StatusBadge status={o.labOrderStatus} />
                  </div>
                  <p className="text-sm text-text-secondary">Order #{o.labOrderNumber || o.labOrderId}</p>
                  {o.labOrderNotes && <p className="text-sm text-text-light mt-1">Notes: {o.labOrderNotes}</p>}
                  <p className="text-xs text-text-light mt-1">{o.labOrderCreatedAt ? new Date(o.labOrderCreatedAt).toLocaleDateString('en-IN') : ''}</p>
                </div>
                {o.labOrderTestUrgency && (
                  <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg ${o.labOrderTestUrgency === 'URGENT' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    {o.labOrderTestUrgency}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

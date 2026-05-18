import { Receipt, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import usePagedData from '../../hooks/usePagedData';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';

export default function PatientBills() {
  const { data, page, setPage, totalPages, loading } = usePagedData('/patients/view-own-bills');

  const handleDownload = async (id) => {
    try {
      const res = await api.get(`/bills/${id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bill-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  };

  const fmt = (v) => v != null ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—';

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Bills" subtitle="View your billing history and download invoices" />
      {data.length === 0 ? (
        <EmptyState icon={Receipt} title="No bills" message="You don't have any bills yet." />
      ) : (
        <div className="space-y-4">
          {data.map((b, i) => (
            <motion.div key={b.billId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-heading text-base font-bold text-navy">Bill #{b.billId}</h3>
                    <StatusBadge status={b.paymentStatuses} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <div><p className="text-[11px] text-text-light uppercase">Total</p><p className="text-sm font-bold text-navy">{fmt(b.totalAmount)}</p></div>
                    <div><p className="text-[11px] text-text-light uppercase">Paid</p><p className="text-sm font-bold text-emerald-600">{fmt(b.amountPaid)}</p></div>
                    <div><p className="text-[11px] text-text-light uppercase">Balance</p><p className="text-sm font-bold text-red-500">{fmt(b.balanceDue)}</p></div>
                    <div><p className="text-[11px] text-text-light uppercase">Date</p><p className="text-sm text-text-secondary">{b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : '—'}</p></div>
                  </div>
                  {b.billItems?.length > 0 && (
                    <div className="mt-3 bg-gray-50 rounded-xl p-3">
                      <table className="w-full text-xs">
                        <thead><tr className="text-text-light"><th className="text-left pb-1">Item</th><th className="text-right pb-1">Qty</th><th className="text-right pb-1">Price</th><th className="text-right pb-1">Total</th></tr></thead>
                        <tbody>
                          {b.billItems.map((item, idx) => (
                            <tr key={idx} className="text-text-secondary">
                              <td className="py-0.5 font-medium text-text-primary">{item.itemName}</td>
                              <td className="text-right">{item.quantity}</td>
                              <td className="text-right">{fmt(item.unitPrice)}</td>
                              <td className="text-right">{fmt(item.lineTotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <button onClick={() => handleDownload(b.billId)} className="shrink-0 p-2.5 rounded-xl border border-gray-200 hover:bg-teal/5 hover:border-teal/30 transition-colors self-start" title="Download PDF">
                  <Download className="w-4 h-4 text-teal" />
                </button>
              </div>
            </motion.div>
          ))}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

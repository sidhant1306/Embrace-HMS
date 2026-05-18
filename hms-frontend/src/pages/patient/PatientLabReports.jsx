import { FlaskConical } from 'lucide-react';
import { motion } from 'framer-motion';
import usePagedData from '../../hooks/usePagedData';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';

export default function PatientLabReports() {
  const { data, page, setPage, totalPages, loading } = usePagedData('/patients/view-own-lab-reports');

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Lab Reports" subtitle="View your laboratory test reports" />
      {data.length === 0 ? (
        <EmptyState icon={FlaskConical} title="No lab reports" message="You don't have any lab reports yet." />
      ) : (
        <div className="space-y-4">
          {data.map((r, i) => (
            <motion.div key={r.labReportId} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
                  <FlaskConical className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-base font-bold text-navy">Lab Report #{r.labReportId}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-text-secondary">
                    {r.doctorNotes && <span>📝 {r.doctorNotes}</span>}
                    <span>📅 {r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString('en-IN') : 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {r.isViewedByPatient ? (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Viewed</span>
                  ) : (
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">New</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

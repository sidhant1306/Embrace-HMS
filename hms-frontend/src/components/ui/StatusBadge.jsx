const STATUS_STYLES = {
  // Appointment / General
  SCHEDULED:  'bg-blue-50 text-blue-700 ring-blue-200',
  CONFIRMED:  'bg-teal/10 text-teal ring-teal/20',
  APPROVED:   'bg-teal/10 text-teal ring-teal/20',
  REJECTED:   'bg-red-50 text-red-600 ring-red-200',
  RESCHEDULED:'bg-indigo-50 text-indigo-700 ring-indigo-200',
  COMPLETED:  'bg-emerald-50 text-emerald-700 ring-emerald-200',
  CANCELLED:  'bg-red-50 text-red-600 ring-red-200',
  PENDING:    'bg-amber-50 text-amber-700 ring-amber-200',
  NO_SHOW:    'bg-gray-100 text-gray-500 ring-gray-200',
  IN_PROGRESS:'bg-violet-50 text-violet-700 ring-violet-200',

  // Bed
  AVAILABLE:  'bg-emerald-50 text-emerald-700 ring-emerald-200',
  OCCUPIED:   'bg-red-50 text-red-600 ring-red-200',
  MAINTENANCE:'bg-amber-50 text-amber-700 ring-amber-200',
  RESERVED:   'bg-blue-50 text-blue-700 ring-blue-200',

  // Admission
  ADMITTED:   'bg-blue-50 text-blue-700 ring-blue-200',
  DISCHARGED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',

  // Payment
  PAID:       'bg-emerald-50 text-emerald-700 ring-emerald-200',
  UNPAID:     'bg-red-50 text-red-600 ring-red-200',
  PARTIAL:    'bg-amber-50 text-amber-700 ring-amber-200',

  // Prescription
  WRITTEN:    'bg-violet-50 text-violet-700 ring-violet-200',
  SENT_TO_RECEPTIONIST: 'bg-blue-50 text-blue-700 ring-blue-200',
  RECEIVED_BY_RECEPTIONIST: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  PRINTED:    'bg-emerald-50 text-emerald-700 ring-emerald-200',
  SENT_TO_LAB_TECHNICIAN: 'bg-amber-50 text-amber-700 ring-amber-200',
  DISPENSED:  'bg-teal/10 text-teal ring-teal/20',

  // Lab
  ORDERED:    'bg-blue-50 text-blue-700 ring-blue-200',
  SAMPLE_COLLECTED: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  REPORT_UPLOADED:  'bg-emerald-50 text-emerald-700 ring-emerald-200',

  // Consultation
  ACTIVE:     'bg-blue-50 text-blue-700 ring-blue-200',
};

const FALLBACK = 'bg-gray-100 text-gray-600 ring-gray-200';

export default function StatusBadge({ status, className = '' }) {
  if (!status) return null;
  const label = String(status).replace(/_/g, ' ');
  const style = STATUS_STYLES[status] || FALLBACK;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-lg ring-1 ${style} ${className}`}>
      {label}
    </span>
  );
}

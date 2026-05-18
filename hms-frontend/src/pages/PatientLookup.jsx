import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  User,
  CalendarDays,
  Stethoscope,
  FlaskConical,
  FileText,
  Receipt,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Phone,
  Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import PageHeader from '../components/ui/PageHeader';
import Spinner from '../components/ui/Spinner';

const SECTION_CONFIG = [
  { key: 'appointments', label: 'Appointments', icon: CalendarDays, color: 'from-blue-500 to-blue-600', columns: ['ID', 'Date', 'Status', 'Doctor'] },
  { key: 'consultations', label: 'Consultations', icon: Stethoscope, color: 'from-teal to-teal-dark', columns: ['ID', 'Complaint', 'Status', 'Doctor', 'Appt ID'] },
  { key: 'labOrders', label: 'Lab Orders', icon: FlaskConical, color: 'from-cyan-500 to-blue-500', columns: ['ID', 'Test', 'Status', 'Urgency', 'Consult ID'] },
  { key: 'prescriptions', label: 'Prescriptions', icon: FileText, color: 'from-violet-500 to-purple-600', columns: ['ID', 'Rx #', 'Status', 'Consult ID'] },
  { key: 'bills', label: 'Bills', icon: Receipt, color: 'from-amber-500 to-orange-500', columns: ['ID', 'Amount', 'Status', 'Consult ID'] },
];

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="inline-flex items-center gap-0.5 text-text-light hover:text-teal transition-colors" title="Copy ID">
      {copied ? <Check className="w-3 h-3 text-teal" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function IdCell({ value }) {
  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-navy">
      #{value} <CopyButton value={value} />
    </span>
  );
}

export default function PatientLookup() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const handleSearch = useCallback(async (e) => {
    e?.preventDefault();
    if (!query.trim() || query.trim().length < 2) {
      toast.error('Enter at least 2 characters to search');
      return;
    }
    setSearching(true);
    setSelectedPatient(null);
    setDetails(null);
    try {
      const { data } = await api.get(`/patient-lookup/search?q=${encodeURIComponent(query.trim())}`);
      setSearchResults(data);
      if (data.length === 0) {
        toast('No patients found', { icon: '🔍' });
      }
    } catch {
      toast.error('Search failed');
    }
    setSearching(false);
  }, [query]);

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setLoadingDetails(true);
    setExpandedSections({});
    try {
      const { data } = await api.get(`/patient-lookup/${patient.patientId}/details`);
      setDetails(data);
      // Auto-expand sections with data
      const expanded = {};
      SECTION_CONFIG.forEach(s => {
        if (data[s.key]?.length > 0) expanded[s.key] = true;
      });
      setExpandedSections(expanded);
    } catch {
      toast.error('Failed to load patient details');
    }
    setLoadingDetails(false);
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderCellValue = (sectionKey, col, item) => {
    switch (sectionKey) {
      case 'appointments':
        if (col === 'ID') return <IdCell value={item.appointmentId} />;
        if (col === 'Date') return item.date || '—';
        if (col === 'Status') return <StatusPill status={item.status} />;
        if (col === 'Doctor') return item.doctorName || '—';
        break;
      case 'consultations':
        if (col === 'ID') return <IdCell value={item.consultationId} />;
        if (col === 'Complaint') return <span className="truncate max-w-[150px] block">{item.complaint || '—'}</span>;
        if (col === 'Status') return <StatusPill status={item.status} />;
        if (col === 'Doctor') return item.doctorName || '—';
        if (col === 'Appt ID') return item.appointmentId ? <IdCell value={item.appointmentId} /> : '—';
        break;
      case 'labOrders':
        if (col === 'ID') return <IdCell value={item.labOrderId} />;
        if (col === 'Test') return item.testName || '—';
        if (col === 'Status') return <StatusPill status={item.status} />;
        if (col === 'Urgency') return item.urgency === 'URGENT'
          ? <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg">URGENT</span>
          : <span className="text-[10px] text-text-light">{item.urgency || '—'}</span>;
        if (col === 'Consult ID') return item.consultationId ? <IdCell value={item.consultationId} /> : '—';
        break;
      case 'prescriptions':
        if (col === 'ID') return <IdCell value={item.prescriptionId} />;
        if (col === 'Rx #') return item.prescriptionNumber || '—';
        if (col === 'Status') return <StatusPill status={item.status} />;
        if (col === 'Consult ID') return item.consultationId ? <IdCell value={item.consultationId} /> : '—';
        break;
      case 'bills':
        if (col === 'ID') return <IdCell value={item.billId} />;
        if (col === 'Amount') return item.totalAmount != null ? `₹${(item.totalAmount / 100).toFixed(2)}` : '—';
        if (col === 'Status') return <StatusPill status={item.status} />;
        if (col === 'Consult ID') return item.consultationId ? <IdCell value={item.consultationId} /> : '—';
        break;
    }
    return '—';
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Patient Lookup" subtitle="Search patients and find all linked records, IDs, and details" />

      {/* ── Search Bar ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-light" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by patient name, phone, or email..."
              className="w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl border border-gray-200 bg-white focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-navy to-navy-light rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </motion.div>

      {/* ── Search Results ── */}
      {searchResults !== null && searchResults.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-navy/[0.02] to-transparent">
            <h3 className="font-heading font-bold text-navy text-sm">{searchResults.length} Patient{searchResults.length > 1 ? 's' : ''} Found</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {searchResults.map((p) => (
              <button
                key={p.patientId}
                onClick={() => handleSelectPatient(p)}
                className={`w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-navy/[0.02] transition-colors ${
                  selectedPatient?.patientId === p.patientId ? 'bg-teal/5 border-l-3 border-teal' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy to-navy-light flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading text-sm font-bold text-navy">{p.name}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-text-secondary">
                    {p.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {p.phone}</span>}
                    {p.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {p.email}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-text-light uppercase">Patient ID</span>
                  <p className="font-mono text-sm font-bold text-navy">#{p.patientId}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Patient Details Panel ── */}
      <AnimatePresence>
        {selectedPatient && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {loadingDetails ? (
              <div className="py-12"><Spinner /></div>
            ) : details ? (
              <div className="space-y-4">
                {/* Patient Summary Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shadow-lg">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-heading text-xl font-bold text-navy">{details.patient?.name}</h2>
                      <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-text-secondary">
                        <span className="font-mono bg-navy/5 px-2 py-0.5 rounded-lg text-xs font-bold text-navy">
                          Patient ID: #{details.patient?.patientId} <CopyButton value={details.patient?.patientId} />
                        </span>
                        <span className="font-mono bg-navy/5 px-2 py-0.5 rounded-lg text-xs font-bold text-navy">
                          User ID: #{details.patient?.userId} <CopyButton value={details.patient?.userId} />
                        </span>
                        {details.patient?.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {details.patient.phone}</span>}
                        {details.patient?.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {details.patient.email}</span>}
                        {details.patient?.gender && <span>Gender: {details.patient.gender}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Linked Records Sections ── */}
                {SECTION_CONFIG.map((section) => {
                  const items = details[section.key] || [];
                  const SIcon = section.icon;
                  const isExpanded = expandedSections[section.key];

                  return (
                    <div key={section.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <button
                        onClick={() => toggleSection(section.key)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                            <SIcon className="w-4.5 h-4.5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-heading text-sm font-bold text-navy">{section.label}</h3>
                            <p className="text-[11px] text-text-light">{items.length} record{items.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {items.length > 0 && (
                            <span className="w-6 h-6 rounded-full bg-navy/10 text-navy text-xs font-bold flex items-center justify-center">{items.length}</span>
                          )}
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-text-light" /> : <ChevronDown className="w-4 h-4 text-text-light" />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && items.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-4">
                              <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      {section.columns.map((col) => (
                                        <th key={col} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-text-light tracking-wider">
                                          {col}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50">
                                    {items.map((item, idx) => (
                                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        {section.columns.map((col) => (
                                          <td key={col} className="px-3 py-2.5 text-xs text-text-primary whitespace-nowrap">
                                            {renderCellValue(section.key, col, item)}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        {isExpanded && items.length === 0 && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            <p className="px-5 pb-4 text-xs text-text-light">No {section.label.toLowerCase()} found for this patient.</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusPill({ status }) {
  if (!status) return <span className="text-xs text-text-light">—</span>;
  const s = String(status).replace(/_/g, ' ');
  let colors = 'bg-gray-100 text-gray-600';
  const lower = s.toLowerCase();
  if (lower.includes('confirm') || lower.includes('active') || lower.includes('complet') || lower.includes('paid') || lower.includes('normal'))
    colors = 'bg-emerald-50 text-emerald-700';
  else if (lower.includes('pending') || lower.includes('ordered') || lower.includes('written') || lower.includes('progress'))
    colors = 'bg-amber-50 text-amber-700';
  else if (lower.includes('cancel'))
    colors = 'bg-red-50 text-red-600';
  else if (lower.includes('sent') || lower.includes('sample') || lower.includes('printed'))
    colors = 'bg-blue-50 text-blue-600';

  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-lg ${colors}`}>
      {s}
    </span>
  );
}

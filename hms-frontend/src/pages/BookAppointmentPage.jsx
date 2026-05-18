import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  X,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  CalendarDays,
  Timer,
  FileText,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Heart,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import allDoctors from '../data/doctors';

/* ──────────────────────────── STATIC DOCTOR DATA ──────────────────────────── */
const doctors = allDoctors;

const specializations = [
  'All',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Oncology',
  'Ophthalmology',
  'General Medicine',
  'Dermatology',
  'ENT',
  'Gynecology',
  'Gastroenterology',
  'Psychiatry',
  'Pulmonology',
  'Nephrology',
  'Urology',
  'Endocrinology',
];

/* ──────────────────────────── DOCTOR DETAIL MODAL ──────────────────────────── */
function DoctorModal({ doctor, onClose }) {
  if (!doctor) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-navy to-navy-light p-8 rounded-t-3xl">
            <button
              onClick={onClose}
              id="modal-close"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="flex items-center gap-5">
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${doctor.gradient} flex items-center justify-center shadow-xl border-4 border-white/20`}
              >
                <span className="text-white font-heading text-2xl font-bold">
                  {doctor.initials}
                </span>
              </div>
              <div>
                <h3 className="font-heading text-2xl font-bold text-white">{doctor.name}</h3>
                <span className="inline-block mt-1 px-3 py-1 bg-teal/90 text-white text-xs font-semibold rounded-full">
                  {doctor.specialization}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-5">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-9 h-9 rounded-xl bg-navy/5 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-navy" />
              </div>
              <div>
                <p className="text-text-light text-xs">Location</p>
                <p className="font-semibold text-text-primary">{doctor.room}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-9 h-9 rounded-xl bg-navy/5 flex items-center justify-center">
                <Clock className="w-4 h-4 text-navy" />
              </div>
              <div>
                <p className="text-text-light text-xs">Working Hours</p>
                <p className="font-semibold text-text-primary">{doctor.hours}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <h4 className="font-heading font-bold text-navy text-sm mb-2">About</h4>
              <p className="text-sm text-text-secondary leading-relaxed">{doctor.bio}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ──────────────────────────── CONFIRMATION CARD ──────────────────────────── */
function ConfirmationCard({ data, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto"
    >
      <div className="bg-white rounded-3xl shadow-xl border border-teal/20 overflow-hidden">
        <div className="bg-gradient-to-r from-teal to-teal-dark p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <CheckCircle2 className="w-16 h-16 text-white mx-auto mb-4" />
          </motion.div>
          <h3 className="font-heading text-2xl font-bold text-white">Appointment Booked!</h3>
          <p className="text-white/80 text-sm mt-1">Your appointment has been confirmed.</p>
        </div>
        <div className="p-8 space-y-4">
          <InfoRow label="Patient" value={data.patientName} />
          <InfoRow label="Doctor" value={data.doctorName} />
          <InfoRow label="Specialization" value={data.specialization} />
          <InfoRow label="Date" value={data.date} />
          <InfoRow label="Time" value={data.time} />
          <InfoRow label="Reason" value={data.reason} />
          <button
            onClick={onReset}
            id="book-another"
            className="w-full mt-6 py-3 text-sm font-semibold text-navy border-2 border-navy/20 rounded-2xl hover:bg-navy hover:text-white transition-all duration-300"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
      <span className="text-text-light text-sm shrink-0">{label}</span>
      <span className="text-sm font-semibold text-text-primary text-right">{value}</span>
    </div>
  );
}

/* ──────────────────────────── MAIN PAGE COMPONENT ──────────────────────────── */
export default function BookAppointmentPage({ embed = false }) {
  const navigate = useNavigate();
  const { isAuthenticated, userName, role } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [modalDoctor, setModalDoctor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [apiDoctors, setApiDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Form state
  const [form, setForm] = useState({
    patientName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    reason: '',
  });
  const [errors, setErrors] = useState({});

  const formRef = useRef(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-50px' });
  const dropdownRef = useRef(null);

  // Auto-fill patient details when logged in
  useEffect(() => {
    if (isAuthenticated() && role === 'PATIENT') {
      (async () => {
        try {
          const res = await api.get('/patients/view-own-details');
          const p = res.data;
          setForm((prev) => ({
            ...prev,
            patientName: p.patientName || prev.patientName,
            email: p.patientEmail || prev.email,
            phone: p.patientPhone || prev.phone,
          }));
        } catch { /* fallback — user fills manually */ }
      })();
    }
  }, []);

  // Fetch real doctors from the API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors');
        const mapped = (res.data || []).map((d) => {
          const initials = (d.doctorName || '')
            .split(' ')
            .filter((w) => w.length > 0)
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
          const gradients = [
            'from-navy to-navy-light',
            'from-teal to-teal-dark',
            'from-purple-600 to-indigo-700',
            'from-rose-500 to-pink-600',
            'from-amber-500 to-orange-600',
            'from-emerald-500 to-green-600',
            'from-sky-500 to-blue-600',
            'from-violet-500 to-purple-600',
            'from-red-500 to-rose-600',
            'from-pink-500 to-fuchsia-600',
          ];
          return {
            id: d.doctorId,
            name: d.doctorName || 'Unknown Doctor',
            initials,
            specialization: d.doctorSpecialization || 'General',
            room: d.doctorRoom || 'TBD',
            hours: d.doctorWorkingHours || 'Contact reception',
            gradient: gradients[d.doctorId % gradients.length],
            bio: `${d.doctorName} — ${d.doctorSpecialization || 'General'} specialist at Embrace Hospital.`,
            fromApi: true,
          };
        });
        setApiDoctors(mapped);
      } catch {
        // API unavailable — will fall back to static list
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Use API doctors if available, otherwise static list
  const activeDoctors = apiDoctors.length > 0 ? apiDoctors : doctors;

  // Filter doctors
  const filteredDoctors = useMemo(() => {
    return activeDoctors.filter((doc) => {
      const matchSpec = selectedSpec === 'All' || doc.specialization === selectedSpec;
      const matchSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSpec && matchSearch;
    });
  }, [searchQuery, selectedSpec, activeDoctors]);

  // Select doctor handler
  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setConfirmationData(null);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Form change
  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!form.patientName.trim()) newErrors.patientName = 'Patient name is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s\-]{7,15}$/.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid phone number';
    }
    if (!form.date) {
      newErrors.date = 'Appointment date is required';
    } else {
      const selected = new Date(form.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) newErrors.date = 'Date must be in the future';
    }
    if (!form.time) newErrors.time = 'Appointment time is required';
    if (!form.reason.trim()) newErrors.reason = 'Reason for visit is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      toast.error('Please log in to book an appointment.');
      navigate('/login');
      return;
    }
    if (selectedDoctor && !selectedDoctor.fromApi) {
      toast.error('This doctor is not yet registered in the system. Please ask admin to register doctors first.');
      return;
    }
    if (!validate()) {
      toast.error('Please fix the highlighted errors.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/patients/book-own-appointment', {
        doctorId: selectedDoctor.id,
        appointmentDate: form.date,
        appointmentTime: `${form.date}T${form.time}:00`,
        appointmentReason: form.reason,
      });

      toast.success('Appointment booked successfully!');
      setConfirmationData({
        patientName: form.patientName,
        doctorName: selectedDoctor.name,
        specialization: selectedDoctor.specialization,
        date: new Date(form.date).toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        time: form.time,
        reason: form.reason,
      });
      setForm({ patientName: '', email: '', phone: '', date: '', time: '', reason: '' });
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        toast.error('Unable to connect to the server. Please make sure the backend is running.');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        const msg = err.response?.data?.message || err.response?.data || 'Failed to book appointment. Please try again.';
        toast.error(typeof msg === 'string' ? msg : 'Failed to book appointment. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset everything
  const handleReset = () => {
    setConfirmationData(null);
    setSelectedDoctor(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Today's date as min for date picker (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className={embed ? '' : 'min-h-screen bg-white'}>
      {!embed && <Navbar />}

      <main className={embed ? '' : 'pt-24 pb-20'}>
        {/* ─── SECTION 1: DOCTOR LISTING ─── */}
        <section ref={sectionRef} id="doctor-listing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-teal/10 text-teal text-sm font-semibold rounded-full mb-4">
              Book Appointment
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-navy">
              Find Your Doctor
            </h1>
            <p className="mt-3 text-lg text-text-secondary max-w-xl mx-auto">
              Search by name or filter by specialization to find the right doctor for you.
            </p>
          </motion.div>

          {/* ── Search + Filter Bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-4 mb-10"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
              <input
                id="doctor-search"
                type="text"
                placeholder="Search by doctor name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-sm rounded-2xl border border-gray-200 bg-white focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all placeholder:text-text-light"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light hover:text-navy transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Specialization Dropdown */}
            <div className="relative sm:w-64" ref={dropdownRef}>
              <button
                id="spec-dropdown"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-sm rounded-2xl border border-gray-200 bg-white hover:border-teal/40 focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all"
              >
                <span className={selectedSpec === 'All' ? 'text-text-light' : 'text-text-primary font-medium'}>
                  {selectedSpec === 'All' ? 'All Specializations' : selectedSpec}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-text-light transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-30 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 py-2 max-h-64 overflow-y-auto"
                  >
                    {specializations.map((spec) => (
                      <button
                        key={spec}
                        onClick={() => {
                          setSelectedSpec(spec);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${
                          selectedSpec === spec
                            ? 'bg-teal/10 text-teal font-semibold'
                            : 'text-text-secondary hover:bg-gray-50'
                        }`}
                      >
                        {spec === 'All' ? 'All Specializations' : spec}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Doctor Cards Grid ── */}
          {filteredDoctors.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Search className="w-12 h-12 text-text-light/40 mx-auto mb-4" />
              <p className="text-text-secondary font-medium">No doctors found matching your criteria.</p>
              <p className="text-text-light text-sm mt-1">Try adjusting your search or filter.</p>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor, index) => {
                const isSelected = selectedDoctor?.id === doctor.id;
                return (
                  <motion.div
                    key={doctor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    id={`doctor-card-${doctor.id}`}
                    className={`group relative bg-white rounded-2xl p-6 border-2 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'border-teal shadow-lg shadow-teal/10 ring-2 ring-teal/20'
                        : 'border-gray-100 hover:border-teal/30'
                    }`}
                  >
                    {/* Selected badge */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-teal rounded-full flex items-center justify-center shadow-lg"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </motion.div>
                    )}

                    <div className="flex flex-col items-center text-center">
                      {/* Avatar */}
                      <div
                        className={`w-20 h-20 rounded-full bg-gradient-to-br ${doctor.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform duration-300`}
                      >
                        <span className="text-white font-heading text-xl font-bold">
                          {doctor.initials}
                        </span>
                      </div>

                      {/* Name */}
                      <h3 className="font-heading text-lg font-bold text-navy">
                        {doctor.name}
                      </h3>

                      {/* Specialization badge */}
                      <span className="inline-block mt-1.5 px-3 py-1 bg-teal/10 text-teal text-xs font-semibold rounded-full">
                        {doctor.specialization}
                      </span>

                      {/* Details */}
                      <div className="mt-4 space-y-2 w-full text-left">
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <MapPin className="w-3.5 h-3.5 text-navy/50 shrink-0" />
                          <span>{doctor.room}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <Clock className="w-3.5 h-3.5 text-navy/50 shrink-0" />
                          <span>{doctor.hours}</span>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="mt-5 flex gap-2 w-full">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalDoctor(doctor);
                          }}
                          id={`view-details-${doctor.id}`}
                          className="flex-1 py-2.5 text-xs font-semibold text-navy border-2 border-navy/15 rounded-xl hover:bg-navy/5 transition-all duration-300"
                        >
                          View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectDoctor(doctor);
                          }}
                          id={`select-doctor-${doctor.id}`}
                          className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 ${
                            isSelected
                              ? 'bg-teal text-white shadow-md'
                              : 'bg-gradient-to-r from-teal to-teal-dark text-white hover:shadow-lg hover:shadow-teal/25'
                          }`}
                        >
                          {isSelected ? '✓ Selected' : 'Select Doctor'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── SECTION 2: APPOINTMENT FORM ─── */}
        <AnimatePresence>
          {selectedDoctor && !confirmationData && (
            <motion.section
              ref={formRef}
              id="appointment-form-section"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.6 }}
              className="relative mt-20 py-20 bg-blue-gray overflow-hidden"
            >
              {/* ── Background watermarks ── */}
              <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                {/* Stethoscope SVG watermark */}
                <svg
                  className="absolute top-16 left-8 w-48 h-48 opacity-[0.04] text-navy"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <path d="M6 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                  <path d="M4 16V7a5 5 0 0 1 10 0v2" />
                  <path d="M14 9a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
                  <path d="M18 9v3a6 6 0 0 1-6 6h0a6 6 0 0 1-6-6" />
                </svg>
                {/* Heartbeat line */}
                <svg
                  className="absolute bottom-20 right-0 w-[600px] h-32 opacity-[0.04]"
                  viewBox="0 0 600 80"
                  fill="none"
                >
                  <path
                    d="M0,40 L100,40 L120,40 L140,10 L160,70 L180,5 L200,75 L220,40 L240,40 L600,40"
                    stroke="#003580"
                    strokeWidth="2.5"
                  />
                </svg>
                {/* Microscope icon */}
                <svg
                  className="absolute top-1/2 right-12 w-40 h-40 -translate-y-1/2 opacity-[0.04] text-teal"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <path d="M6 18h8" />
                  <path d="M3 22h18" />
                  <path d="M14 22a7 7 0 1 0 0-14h-1" />
                  <path d="M9 14h2" />
                  <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
                  <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
                </svg>
                {/* Floating crosses */}
                <div className="absolute top-10 right-1/4 w-16 h-16 opacity-[0.03]">
                  <div className="absolute top-1/2 left-0 right-0 h-3 bg-navy -translate-y-1/2" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-3 bg-navy -translate-x-1/2" />
                </div>
                <div className="absolute bottom-16 left-1/3 w-12 h-12 opacity-[0.03]">
                  <div className="absolute top-1/2 left-0 right-0 h-2 bg-teal -translate-y-1/2" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-teal -translate-x-1/2" />
                </div>
              </div>

              <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
                {/* Section header */}
                <div className="text-center mb-10">
                  <Sparkles className="w-6 h-6 text-teal mx-auto mb-3" />
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-navy">
                    Book Your Appointment
                  </h2>
                {/* Login prompt if not authenticated */}
                {!isAuthenticated() && (
                  <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-800">Login Required</p>
                      <p className="text-xs text-amber-600 mt-0.5">You need to be logged in as a patient to book an appointment.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="shrink-0 px-4 py-2 text-xs font-semibold text-white bg-navy rounded-xl hover:bg-navy-dark transition-colors"
                    >
                      Log In
                    </button>
                  </div>
                )}

                <p className="text-text-secondary text-sm mt-2">
                  Fill in the details below to schedule your visit.
                </p>
                </div>

                {/* Selected Doctor Chip */}
                <div className="flex items-center justify-center mb-8">
                  <div className="inline-flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-md border border-teal/20">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${selectedDoctor.gradient} flex items-center justify-center`}
                    >
                      <span className="text-white font-heading text-sm font-bold">
                        {selectedDoctor.initials}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy">{selectedDoctor.name}</p>
                      <p className="text-xs text-teal font-medium">{selectedDoctor.specialization}</p>
                    </div>
                    <button
                      onClick={() => setSelectedDoctor(null)}
                      className="ml-2 w-7 h-7 rounded-full bg-gray-100 hover:bg-red-50 flex items-center justify-center transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-text-light hover:text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Patient Name */}
                  <FormField
                    id="patient-name"
                    label="Patient Name"
                    icon={User}
                    error={errors.patientName}
                  >
                    <input
                      id="patient-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={form.patientName}
                      onChange={(e) => handleFormChange('patientName', e.target.value)}
                      className={inputClass(errors.patientName)}
                    />
                  </FormField>

                  {/* Email + Phone row */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <FormField id="email" label="Email Address" icon={Mail} error={errors.email}>
                      <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        className={inputClass(errors.email)}
                      />
                    </FormField>

                    <FormField id="phone" label="Phone Number" icon={Phone} error={errors.phone}>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={(e) => handleFormChange('phone', e.target.value)}
                        className={inputClass(errors.phone)}
                      />
                    </FormField>
                  </div>

                  {/* Date + Time row */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <FormField
                      id="appointment-date"
                      label="Appointment Date"
                      icon={CalendarDays}
                      error={errors.date}
                    >
                      <input
                        id="appointment-date"
                        type="date"
                        min={todayStr}
                        value={form.date}
                        onChange={(e) => handleFormChange('date', e.target.value)}
                        className={inputClass(errors.date)}
                      />
                    </FormField>

                    <FormField
                      id="appointment-time"
                      label="Preferred Time"
                      icon={Timer}
                      error={errors.time}
                    >
                      <input
                        id="appointment-time"
                        type="time"
                        value={form.time}
                        onChange={(e) => handleFormChange('time', e.target.value)}
                        className={inputClass(errors.time)}
                      />
                    </FormField>
                  </div>

                  {/* Reason */}
                  <FormField
                    id="reason"
                    label="Reason for Visit"
                    icon={FileText}
                    error={errors.reason}
                  >
                    <textarea
                      id="reason"
                      rows={4}
                      placeholder="Briefly describe your symptoms or reason for the appointment…"
                      value={form.reason}
                      onChange={(e) => handleFormChange('reason', e.target.value)}
                      className={`${inputClass(errors.reason)} resize-none`}
                    />
                  </FormField>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    id="submit-appointment"
                    disabled={isSubmitting}
                    className="group w-full flex items-center justify-center gap-2 py-4 text-base font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-2xl shadow-lg shadow-teal/25 hover:shadow-xl hover:shadow-teal/35 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="opacity-25"
                          />
                          <path
                            d="M4 12a8 8 0 018-8"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                        Booking…
                      </>
                    ) : (
                      <>
                        Confirm Appointment
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ─── CONFIRMATION CARD ─── */}
        {confirmationData && (
          <section className="py-20 px-4 sm:px-6">
            <ConfirmationCard data={confirmationData} onReset={handleReset} />
          </section>
        )}
      </main>

      {/* Doctor Detail Modal */}
      {modalDoctor && (
        <DoctorModal doctor={modalDoctor} onClose={() => setModalDoctor(null)} />
      )}

      {!embed && <Footer />}
    </div>
  );
}

/* ──────────────────────────── REUSABLE FORM FIELD ──────────────────────────── */
function FormField({ id, label, icon: Icon, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold text-navy mb-2">
        <Icon className="w-4 h-4 text-teal" />
        {label}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 mt-1.5 text-xs text-red-500 font-medium"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

/* ──────────────────────────── INPUT CLASS HELPER ──────────────────────────── */
function inputClass(hasError) {
  return `w-full px-4 py-3.5 text-sm rounded-2xl border bg-white focus:outline-none focus:ring-2 transition-all placeholder:text-text-light ${
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-gray-200 focus:border-teal focus:ring-teal/20'
  }`;
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  Send,
  Users,
  Stethoscope,
  UserCircle,
  Receipt,
  FlaskConical,
  Pill,
  Globe,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useNotifications } from '../../context/NotificationContext';

const AUDIENCE_OPTIONS = [
  { value: 'ALL', label: 'Everyone', icon: Globe, color: 'from-navy to-navy-light' },
  { value: 'DOCTOR', label: 'Doctors Only', icon: Stethoscope, color: 'from-blue-500 to-blue-600' },
  { value: 'PATIENT', label: 'Patients Only', icon: UserCircle, color: 'from-teal to-teal-dark' },
  { value: 'RECEPTIONIST', label: 'Receptionists Only', icon: Receipt, color: 'from-amber-500 to-orange-500' },
  { value: 'PHARMACIST', label: 'Pharmacists Only', icon: Pill, color: 'from-emerald-500 to-green-600' },
  { value: 'LAB_TECHNICIAN', label: 'Lab Technicians Only', icon: FlaskConical, color: 'from-cyan-500 to-blue-500' },
  { value: 'ADMIN', label: 'Admins Only', icon: Users, color: 'from-purple-500 to-indigo-600' },
];

const TYPE_OPTIONS = [
  { value: 'info', label: 'Information', icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' },
  { value: 'success', label: 'Success', icon: CheckCircle2, color: 'text-teal', bg: 'bg-teal/10' },
  { value: 'warning', label: 'Warning', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
];

function timeAgo(date) {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 0 || isNaN(seconds)) return 'Just now';
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AdminNotifications() {
  const { refresh } = useNotifications();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('ALL');
  const [type, setType] = useState('info');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [audienceOpen, setAudienceOpen] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const { data } = await api.get('/notifications/broadcast-history');
      setHistory(data);
    } catch {
      // ignore
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    try {
      setSending(true);
      await api.post('/notifications/broadcast', {
        title: title.trim(),
        message: message.trim(),
        targetAudience: audience,
        type,
      });
      toast.success('Notification sent successfully!');
      setTitle('');
      setMessage('');
      setAudience('ALL');
      setType('info');
      loadHistory();
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const selectedAudience = AUDIENCE_OPTIONS.find((a) => a.value === audience);
  const selectedType = TYPE_OPTIONS.find((t) => t.value === type);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-navy to-navy-light rounded-2xl flex items-center justify-center shadow-lg">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-navy">Broadcast Notifications</h1>
            <p className="text-text-secondary text-sm">Send announcements to staff and patients</p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* ── Compose Form ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          <form onSubmit={handleSend} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-navy/[0.02] to-transparent">
              <h2 className="font-heading font-bold text-navy text-lg">Compose Notification</h2>
            </div>

            <div className="p-6 space-y-5">
              {/* Target Audience */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Target Audience</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAudienceOpen(!audienceOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-navy/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {selectedAudience && (
                        <>
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedAudience.color} flex items-center justify-center`}>
                            <selectedAudience.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-text-primary">{selectedAudience.label}</span>
                        </>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-text-light transition-transform ${audienceOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {audienceOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
                      >
                        {AUDIENCE_OPTIONS.map((opt) => {
                          const OptIcon = opt.icon;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => { setAudience(opt.value); setAudienceOpen(false); }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${audience === opt.value ? 'bg-navy/5' : ''}`}
                            >
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${opt.color} flex items-center justify-center`}>
                                <OptIcon className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-medium text-sm text-text-primary">{opt.label}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Notification Type */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Type</label>
                <div className="flex gap-2">
                  {TYPE_OPTIONS.map((opt) => {
                    const TIcon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setType(opt.value)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                          type === opt.value
                            ? `${opt.bg} ${opt.color} border-current`
                            : 'bg-gray-50 text-text-light border-transparent hover:border-gray-200'
                        }`}
                      >
                        <TIcon className="w-4 h-4" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. System Maintenance Notice"
                  maxLength={255}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your notification message here..."
                  maxLength={2000}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all resize-none"
                />
                <p className="text-xs text-text-light mt-1 text-right">{message.length}/2000</p>
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={sending || !title.trim() || !message.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-navy to-navy-light text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* ── Broadcast History ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-navy/[0.02] to-transparent">
              <h2 className="font-heading font-bold text-navy text-lg">Sent History</h2>
              <p className="text-xs text-text-light mt-0.5">{history.length} notifications sent</p>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {loadingHistory ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-2 border-navy/20 border-t-navy rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-text-light">Loading history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="py-12 text-center">
                  <Megaphone className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-text-light font-medium">No broadcasts sent yet</p>
                  <p className="text-xs text-text-light/60 mt-1">Your sent notifications will appear here</p>
                </div>
              ) : (
                history.map((notif) => {
                  const typeStyle = TYPE_OPTIONS.find((t) => t.value === notif.type) || TYPE_OPTIONS[0];
                  const TIcon = typeStyle.icon;
                  return (
                    <div key={notif.id} className="px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg ${typeStyle.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <TIcon className={`w-4 h-4 ${typeStyle.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-navy truncate">{notif.title}</p>
                          <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{notif.message}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-text-light">
                              <Clock className="w-3 h-3" />
                              {timeAgo(notif.createdAt)}
                            </span>
                            <span className="text-[10px] text-text-light">by {notif.senderName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

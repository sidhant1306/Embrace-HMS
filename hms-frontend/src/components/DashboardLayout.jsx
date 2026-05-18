import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  LayoutDashboard,
  CalendarPlus,
  CalendarDays,
  FileText,
  FlaskConical,
  Receipt,
  UserCircle,
  Stethoscope,
  ClipboardList,
  Pill,
  Users,
  UserCog,
  BedDouble,
  BarChart3,
  Package,
  Upload,
  FileSearch,
  Search,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Check,
  CheckCheck,
  Megaphone,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

/* ─────────────────── SIDEBAR NAV CONFIG PER ROLE ─────────────────── */
const SIDEBAR_LINKS = {
  PATIENT: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/patient/dashboard' },
    { name: 'Book Appointment', icon: CalendarPlus, path: '/patient/book-appointment' },
    { name: 'My Appointments', icon: CalendarDays, path: '/patient/appointments' },
    { name: 'Prescriptions', icon: FileText, path: '/patient/prescriptions' },
    { name: 'Lab Reports', icon: FlaskConical, path: '/patient/lab-reports' },
    { name: 'Bills', icon: Receipt, path: '/patient/bills' },
    { name: 'My Profile', icon: UserCircle, path: '/patient/profile' },
  ],
  DOCTOR: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/doctor/dashboard' },
    { name: "Today's Appointments", icon: CalendarDays, path: '/doctor/today-appointments' },
    { name: 'Consultations', icon: Stethoscope, path: '/doctor/consultations' },
    { name: 'Prescriptions', icon: FileText, path: '/doctor/prescriptions' },
    { name: 'Lab Orders', icon: ClipboardList, path: '/doctor/lab-orders' },
    { name: 'Patient Lookup', icon: Search, path: '/doctor/patient-lookup' },
    { name: 'My Profile', icon: UserCircle, path: '/doctor/profile' },
  ],
  ADMIN: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Patients', icon: Users, path: '/admin/patients' },
    { name: 'Doctors', icon: Stethoscope, path: '/admin/doctors' },
    { name: 'Staff', icon: UserCog, path: '/admin/staff' },
    { name: 'Appointments', icon: CalendarDays, path: '/admin/appointments' },
    { name: 'Beds / IPD', icon: BedDouble, path: '/admin/beds' },
    { name: 'Notifications', icon: Megaphone, path: '/admin/notifications' },
    { name: 'Patient Lookup', icon: Search, path: '/admin/patient-lookup' },
    { name: 'Reports', icon: BarChart3, path: '/admin/reports' },
  ],
  SUPER_ADMIN: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Patients', icon: Users, path: '/admin/patients' },
    { name: 'Doctors', icon: Stethoscope, path: '/admin/doctors' },
    { name: 'Staff', icon: UserCog, path: '/admin/staff' },
    { name: 'Appointments', icon: CalendarDays, path: '/admin/appointments' },
    { name: 'Beds / IPD', icon: BedDouble, path: '/admin/beds' },
    { name: 'Notifications', icon: Megaphone, path: '/admin/notifications' },
    { name: 'Patient Lookup', icon: Search, path: '/admin/patient-lookup' },
    { name: 'Reports', icon: BarChart3, path: '/admin/reports' },
  ],
  RECEPTIONIST: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/receptionist/dashboard' },
    { name: 'Book Appointment', icon: CalendarPlus, path: '/receptionist/book-appointment' },
    { name: 'Appointments', icon: CalendarDays, path: '/receptionist/appointments' },
    { name: 'Patients', icon: Users, path: '/receptionist/patients' },
    { name: 'Billing', icon: Receipt, path: '/receptionist/billing' },
    { name: 'Admissions', icon: BedDouble, path: '/receptionist/admissions' },
    { name: 'Prescriptions', icon: FileText, path: '/receptionist/prescriptions' },
    { name: 'Patient Lookup', icon: Search, path: '/receptionist/patient-lookup' },
  ],
  PHARMACIST: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/pharmacist/dashboard' },
    { name: 'Pending Prescriptions', icon: ClipboardList, path: '/pharmacist/pending' },
    { name: 'Dispense Medicine', icon: Pill, path: '/pharmacist/dispense' },
    { name: 'Inventory', icon: Package, path: '/pharmacist/inventory' },
    { name: 'Patient Lookup', icon: Search, path: '/pharmacist/patient-lookup' },
  ],
  LAB_TECHNICIAN: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/lab/dashboard' },
    { name: 'Pending Orders', icon: ClipboardList, path: '/lab/pending' },
    { name: 'Upload Report', icon: Upload, path: '/lab/upload' },
    { name: 'All Reports', icon: FileSearch, path: '/lab/reports' },
    { name: 'Patient Lookup', icon: Search, path: '/lab/patient-lookup' },
  ],
};

const ROLE_LABELS = {
  PATIENT: 'Patient',
  DOCTOR: 'Doctor',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
  RECEPTIONIST: 'Receptionist',
  PHARMACIST: 'Pharmacist',
  LAB_TECHNICIAN: 'Lab Technician',
};

const ROLE_COLORS = {
  PATIENT: 'bg-teal/15 text-teal',
  DOCTOR: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-purple-100 text-purple-700',
  SUPER_ADMIN: 'bg-red-100 text-red-700',
  RECEPTIONIST: 'bg-amber-100 text-amber-700',
  PHARMACIST: 'bg-emerald-100 text-emerald-700',
  LAB_TECHNICIAN: 'bg-cyan-100 text-cyan-700',
};

const NOTIF_ICONS = {
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' },
  success: { icon: CheckCircle2, color: 'text-teal', bg: 'bg-teal/10' },
  warning: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
  error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
};

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

/* ─────────────────── DASHBOARD LAYOUT COMPONENT ─────────────────── */
export default function DashboardLayout() {
  const { userName, role, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const links = SIDEBAR_LINKS[role] || SIDEBAR_LINKS.PATIENT;
  const initials = userName
    ? userName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Close notification dropdown on click outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Get current page name for breadcrumb
  const currentLink = links.find((l) => l.path === location.pathname);
  const currentPageName = currentLink?.name || 'Dashboard';

  return (
    <div className="min-h-screen bg-blue-gray flex">
      {/* ── MOBILE OVERLAY ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR ── */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50 flex flex-col bg-white border-r border-gray-100 shadow-sm
          transition-all duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static
          ${collapsed ? 'w-20' : 'w-72'}
        `}
      >
        {/* Logo area */}
        <div className={`flex items-center h-18 border-b border-gray-100 shrink-0 ${collapsed ? 'justify-center px-2' : 'px-6'}`}>
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-navy to-teal rounded-xl flex items-center justify-center shadow-md shrink-0">
              <Heart className="w-5 h-5 text-white" fill="white" strokeWidth={0} />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col overflow-hidden"
              >
                <span className="font-heading text-lg font-bold text-navy leading-tight truncate">Embrace</span>
                <span className="text-[10px] font-semibold text-teal uppercase tracking-[0.2em] -mt-0.5">Hospital</span>
              </motion.div>
            )}
          </Link>

          {/* Mobile close */}
          <button onClick={() => setMobileOpen(false)} className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                id={`sidebar-${link.name.toLowerCase().replace(/[\s/']/g, '-')}`}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-teal to-teal-dark text-white shadow-md shadow-teal/20'
                    : 'text-text-secondary hover:bg-navy/5 hover:text-navy'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? link.name : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-text-light group-hover:text-navy'}`} />
                {!collapsed && (
                  <span className="truncate">{link.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse button (desktop only) */}
        <div className="hidden lg:flex items-center justify-center py-2 border-t border-gray-100">
          <button
            onClick={() => setCollapsed(!collapsed)}
            id="sidebar-collapse"
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-navy/10 flex items-center justify-center transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-text-secondary" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-text-secondary" />
            )}
          </button>
        </div>

        {/* User info */}
        <div className={`border-t border-gray-100 p-4 shrink-0 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          <div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'gap-3'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy to-navy-light flex items-center justify-center shrink-0">
              <span className="text-white font-heading text-sm font-bold">{initials}</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{userName}</p>
                <span className={`inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${ROLE_COLORS[role] || 'bg-gray-100 text-gray-600'}`}>
                  {ROLE_LABELS[role] || role}
                </span>
              </div>
            )}
            <button
              onClick={handleLogout}
              id="sidebar-logout"
              className={`p-2 rounded-lg hover:bg-red-50 text-text-light hover:text-red-500 transition-colors ${collapsed ? '' : 'ml-auto'}`}
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-sm">
          {/* Left: mobile menu + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              id="mobile-sidebar-toggle"
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-text-secondary" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-text-light hover:text-teal transition-colors">Home</Link>
              <span className="text-text-light/50">/</span>
              <span className="text-navy font-semibold">{currentPageName}</span>
            </div>
          </div>

          {/* Right: notifications + avatar */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                id="header-notifications"
                className="relative p-2.5 rounded-xl hover:bg-navy/5 transition-colors"
                title="Notifications"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell className="w-5 h-5 text-text-secondary" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60]"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-navy/[0.03] to-transparent">
                      <h3 className="font-heading font-bold text-navy text-sm">Notifications</h3>
                      <div className="flex items-center gap-1.5">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-teal hover:bg-teal/10 rounded-lg transition-colors"
                            title="Mark all as read"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Read all
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={markAllRead}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-text-light hover:text-navy hover:bg-navy/5 rounded-lg transition-colors"
                            title="Mark all read"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-12 text-center">
                          <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                          <p className="text-sm text-text-light font-medium">No notifications yet</p>
                          <p className="text-xs text-text-light/60 mt-1">We'll notify you about important updates</p>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const style = NOTIF_ICONS[notif.type] || NOTIF_ICONS.info;
                          const NIcon = style.icon;
                          return (
                            <button
                              key={notif.id}
                              onClick={() => markRead(notif.id)}
                              className={`w-full text-left flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                                !notif.read ? 'bg-navy/[0.02]' : ''
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                <NIcon className={`w-4 h-4 ${style.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className={`text-sm font-semibold truncate ${!notif.read ? 'text-navy' : 'text-text-secondary'}`}>
                                    {notif.title}
                                  </p>
                                  {!notif.read && (
                                    <span className="w-2 h-2 rounded-full bg-teal shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-text-light mt-0.5 line-clamp-2">{notif.message}</p>
                                <p className="text-[10px] text-text-light/60 mt-1">{timeAgo(notif.createdAt)}</p>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User avatar */}
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-gray-100">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy to-navy-light flex items-center justify-center">
                <span className="text-white font-heading text-xs font-bold">{initials}</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-text-primary leading-tight truncate max-w-[120px]">{userName}</p>
                <p className="text-[11px] text-text-light">{ROLE_LABELS[role] || role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

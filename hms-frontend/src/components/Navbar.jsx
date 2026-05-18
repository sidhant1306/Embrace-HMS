import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Heart, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Departments', path: '/departments' },
  { name: 'Doctors', path: '/doctors' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userName, role, logout, getDashboardRoute } = useAuth();

  const loggedIn = isAuthenticated();
  const dashboardRoute = getDashboardRoute(role);

  // User initials for avatar
  const initials = userName
    ? userName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-navy/5'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" id="logo">
            <div className="w-10 h-10 lg:w-11 lg:h-11 bg-gradient-to-br from-navy to-teal rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="white" strokeWidth={0} />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg lg:text-xl font-bold text-navy leading-tight tracking-tight">
                Embrace
              </span>
              <span className="text-[10px] lg:text-xs font-semibold text-teal uppercase tracking-[0.2em] -mt-0.5">
                Hospital
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  id={`nav-${link.name.toLowerCase()}`}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors group ${
                    isActive
                      ? 'text-navy bg-navy/5'
                      : 'text-text-secondary hover:text-navy hover:bg-navy/5'
                  }`}
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-teal rounded-full transition-all duration-300 ${
                    isActive ? 'w-6' : 'w-0 group-hover:w-6'
                  }`} />
                </Link>
              );
            })}
          </div>

          {/* Desktop Buttons — different states for logged-in vs logged-out */}
          <div className="hidden lg:flex items-center gap-3">
            {loggedIn ? (
              <>
                <Link
                  to={dashboardRoute}
                  id="nav-dashboard"
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-xl hover:shadow-lg hover:shadow-teal/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy to-navy-light flex items-center justify-center">
                    <span className="text-white font-heading text-xs font-bold">{initials}</span>
                  </div>
                  <span className="text-sm font-semibold text-text-primary max-w-[100px] truncate">{userName}</span>
                  <button
                    onClick={handleLogout}
                    id="nav-logout"
                    className="p-2 rounded-lg hover:bg-red-50 text-text-light hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  id="nav-login"
                  className="px-5 py-2.5 text-sm font-semibold text-navy border-2 border-navy/20 rounded-xl hover:border-navy hover:bg-navy hover:text-white transition-all duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/book-appointment"
                  id="nav-book-appointment"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-xl hover:shadow-lg hover:shadow-teal/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Book Appointment
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-toggle"
            className="lg:hidden p-2 rounded-xl text-navy hover:bg-navy/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? 'max-h-[500px] border-t border-navy/5' : 'max-h-0'
        }`}
      >
        <div className="bg-white/98 backdrop-blur-md px-4 py-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  isActive
                    ? 'text-navy bg-navy/5 font-semibold'
                    : 'text-text-secondary hover:text-navy hover:bg-navy/5'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-3 flex flex-col gap-2 border-t border-gray-100">
            {loggedIn ? (
              <>
                <Link
                  to={dashboardRoute}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-xl"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-3 text-sm font-semibold text-navy text-center border-2 border-navy/20 rounded-xl"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/book-appointment"
                  className="px-4 py-3 text-sm font-semibold text-white text-center bg-gradient-to-r from-teal to-teal-dark rounded-xl"
                  onClick={() => setMobileOpen(false)}
                >
                  Book Appointment
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

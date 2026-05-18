import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Heart, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, getDashboardRoute } = useAuth();

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { userEmail: email, userPassword: password });
      const { token, userRole, userName } = res.data;
      login(token, userRole, userName);
      toast.success(`Welcome back, ${userName}!`);
      navigate(getDashboardRoute(userRole), { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field, setter, value) => {
    setter(value);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT BRANDING PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-navy via-navy-dark to-navy overflow-hidden">
        {/* Watermark medical icons */}
        <div className="absolute inset-0 pointer-events-none select-none">
          {/* Stethoscope */}
          <svg className="absolute top-20 left-12 w-56 h-56 opacity-[0.04] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
            <path d="M6 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
            <path d="M4 16V7a5 5 0 0 1 10 0v2" />
            <path d="M14 9a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
            <path d="M18 9v3a6 6 0 0 1-6 6h0a6 6 0 0 1-6-6" />
          </svg>
          {/* Heartbeat */}
          <svg className="absolute bottom-32 left-0 w-full h-24 opacity-[0.05]" viewBox="0 0 800 60" fill="none">
            <path d="M0,30 L150,30 L170,30 L190,5 L210,55 L230,5 L250,55 L270,30 L290,30 L800,30" stroke="white" strokeWidth="1.5" />
          </svg>
          {/* Medical cross */}
          <div className="absolute top-1/3 right-16 w-20 h-20 opacity-[0.04]">
            <div className="absolute top-1/2 left-0 right-0 h-5 bg-white -translate-y-1/2 rounded-sm" />
            <div className="absolute left-1/2 top-0 bottom-0 w-5 bg-white -translate-x-1/2 rounded-sm" />
          </div>
          {/* Pill */}
          <svg className="absolute bottom-1/4 right-24 w-32 h-32 opacity-[0.04] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
            <path d="m8.5 8.5 7 7" />
          </svg>
          {/* Gradient orbs */}
          <div className="absolute -top-32 -left-32 w-72 h-72 bg-teal/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-teal/8 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-teal to-teal-dark rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" fill="white" strokeWidth={0} />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-2xl font-bold text-white leading-tight">Embrace</span>
                <span className="text-xs font-semibold text-teal-light uppercase tracking-[0.2em] -mt-0.5">Hospital</span>
              </div>
            </div>

            <h1 className="font-heading text-4xl xl:text-5xl font-bold text-white leading-tight mb-5">
              Welcome{' '}
              <span className="bg-gradient-to-r from-teal-light to-teal bg-clip-text text-transparent">
                Back
              </span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed max-w-md">
              Access your patient portal, manage appointments, and stay connected with your healthcare team.
            </p>
          </motion.div>

          {/* Feature list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            {['View medical records', 'Book appointments online', 'Chat with your doctor'].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-teal/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-teal" />
                </div>
                <span className="text-white/70 text-sm">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 bg-white">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-navy to-teal rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" strokeWidth={0} />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold text-navy leading-tight">Embrace</span>
              <span className="text-[10px] font-semibold text-teal uppercase tracking-[0.2em] -mt-0.5">Hospital</span>
            </div>
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-navy mb-2">Sign In</h2>
          <p className="text-text-secondary text-sm mb-8">Enter your credentials to access your account.</p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="flex items-center gap-2 text-sm font-semibold text-navy mb-2">
                <Mail className="w-4 h-4 text-teal" />
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => handleFieldChange('email', setEmail, e.target.value)}
                className={`w-full px-4 py-3.5 text-sm rounded-2xl border bg-white focus:outline-none focus:ring-2 transition-all placeholder:text-text-light ${
                  errors.email ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-teal focus:ring-teal/20'
                }`}
              />
              {errors.email && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1 mt-1.5 text-xs text-red-500 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="flex items-center gap-2 text-sm font-semibold text-navy mb-2">
                <Lock className="w-4 h-4 text-teal" />
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => handleFieldChange('password', setPassword, e.target.value)}
                  className={`w-full px-4 py-3.5 pr-12 text-sm rounded-2xl border bg-white focus:outline-none focus:ring-2 transition-all placeholder:text-text-light ${
                    errors.password ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-teal focus:ring-teal/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light hover:text-navy transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errors.password && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1 mt-1.5 text-xs text-red-500 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              disabled={isLoading}
              className="group w-full flex items-center justify-center gap-2 py-4 text-base font-semibold text-white bg-gradient-to-r from-navy to-navy-light rounded-2xl shadow-lg shadow-navy/20 hover:shadow-xl hover:shadow-navy/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-8 text-center text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-teal hover:text-teal-dark transition-colors">
              Register
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

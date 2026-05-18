import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Eye, EyeOff, Heart, ArrowRight, AlertCircle, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const GENDERS = ['MALE', 'FEMALE', 'OTHER'];

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.trim()) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Enter a valid email address';
    }
    if (!form.phone.trim()) {
      e.phone = 'Phone number is required';
    }
    if (!form.password) {
      e.password = 'Password is required';
    } else if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters';
    }
    if (!form.confirmPassword) {
      e.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }
    if (!form.gender) e.gender = 'Please select a gender';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', {
        userName: form.fullName,
        userEmail: form.email,
        userPhone: form.phone,
        userPassword: form.password,
        userGender: form.gender,
      });
      const { token, userRole, userName } = res.data;
      login(token, userRole, userName);
      toast.success('Account created successfully!');
      navigate('/patient/dashboard', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Registration failed. Please try again.';
      if (data) {
        if (typeof data === 'string') {
          msg = data;
        } else if (data.message) {
          msg = data.message;
        } else if (data.fieldErrors) {
          msg = Object.values(data.fieldErrors).join('. ');
        }
      }
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (field) =>
    `w-full px-4 py-3.5 text-sm rounded-2xl border bg-white focus:outline-none focus:ring-2 transition-all placeholder:text-text-light ${
      errors[field] ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-teal focus:ring-teal/20'
    }`;

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT BRANDING PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-navy via-navy-dark to-navy overflow-hidden">
        {/* Watermarks */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <svg className="absolute top-16 right-16 w-48 h-48 opacity-[0.04] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
            <path d="M6 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
            <path d="M4 16V7a5 5 0 0 1 10 0v2" />
            <path d="M14 9a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
            <path d="M18 9v3a6 6 0 0 1-6 6h0a6 6 0 0 1-6-6" />
          </svg>
          <svg className="absolute bottom-28 left-0 w-full h-24 opacity-[0.05]" viewBox="0 0 800 60" fill="none">
            <path d="M0,30 L150,30 L170,30 L190,5 L210,55 L230,5 L250,55 L270,30 L290,30 L800,30" stroke="white" strokeWidth="1.5" />
          </svg>
          <div className="absolute bottom-1/3 right-20 w-16 h-16 opacity-[0.04]">
            <div className="absolute top-1/2 left-0 right-0 h-4 bg-white -translate-y-1/2 rounded-sm" />
            <div className="absolute left-1/2 top-0 bottom-0 w-4 bg-white -translate-x-1/2 rounded-sm" />
          </div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-teal/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-teal/8 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
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
              Join{' '}
              <span className="bg-gradient-to-r from-teal-light to-teal bg-clip-text text-transparent">
                Embrace
              </span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed max-w-md">
              Create your patient account to book appointments, access medical records, and connect with our specialists.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 space-y-4"
          >
            {['Quick online registration', 'Book appointments instantly', 'Secure health records'].map((feature, i) => (
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
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 bg-white py-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-navy to-teal rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" strokeWidth={0} />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold text-navy leading-tight">Embrace</span>
              <span className="text-[10px] font-semibold text-teal uppercase tracking-[0.2em] -mt-0.5">Hospital</span>
            </div>
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-navy mb-2">Create Account</h2>
          <p className="text-text-secondary text-sm mb-8">Register as a patient to get started.</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <Field id="reg-name" label="Full Name" icon={User} error={errors.fullName}>
              <input id="reg-name" type="text" placeholder="John Doe" value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} className={inputCls('fullName')} />
            </Field>

            {/* Email */}
            <Field id="reg-email" label="Email Address" icon={Mail} error={errors.email}>
              <input id="reg-email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className={inputCls('email')} />
            </Field>

            {/* Phone + Gender row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field id="reg-phone" label="Phone Number" icon={Phone} error={errors.phone}>
                <input id="reg-phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} className={inputCls('phone')} />
              </Field>

              {/* Gender dropdown */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-navy mb-2">
                  <User className="w-4 h-4 text-teal" />
                  Gender
                </label>
                <div className="relative">
                  <button
                    type="button"
                    id="reg-gender"
                    onClick={() => setGenderOpen(!genderOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 text-sm rounded-2xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                      errors.gender ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:border-teal focus:ring-teal/20'
                    }`}
                  >
                    <span className={form.gender ? 'text-text-primary' : 'text-text-light'}>
                      {form.gender || 'Select gender'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-text-light transition-transform ${genderOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {genderOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-20 mt-1 w-full bg-white rounded-2xl shadow-xl border border-gray-100 py-1 overflow-hidden"
                    >
                      {GENDERS.map((g) => (
                        <button
                          type="button"
                          key={g}
                          onClick={() => { handleChange('gender', g); setGenderOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            form.gender === g ? 'bg-teal/10 text-teal font-semibold' : 'text-text-secondary hover:bg-gray-50'
                          }`}
                        >
                          {g.charAt(0) + g.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
                {errors.gender && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1 mt-1.5 text-xs text-red-500 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />{errors.gender}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Password */}
            <Field id="reg-password" label="Password" icon={Lock} error={errors.password}>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`${inputCls('password')} pr-12`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light hover:text-navy transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </Field>

            {/* Confirm Password */}
            <Field id="reg-confirm" label="Confirm Password" icon={Lock} error={errors.confirmPassword}>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className={`${inputCls('confirmPassword')} pr-12`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light hover:text-navy transition-colors" tabIndex={-1}>
                  {showConfirm ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </Field>

            {/* Submit */}
            <button
              type="submit"
              id="register-submit"
              disabled={isLoading}
              className="group w-full flex items-center justify-center gap-2 py-4 text-base font-semibold text-white bg-gradient-to-r from-navy to-navy-light rounded-2xl shadow-lg shadow-navy/20 hover:shadow-xl hover:shadow-navy/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-teal hover:text-teal-dark transition-colors">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Reusable field wrapper ── */
function Field({ id, label, icon: Icon, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold text-navy mb-2">
        <Icon className="w-4 h-4 text-teal" />
        {label}
      </label>
      {children}
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1 mt-1.5 text-xs text-red-500 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />{error}
        </motion.p>
      )}
    </div>
  );
}

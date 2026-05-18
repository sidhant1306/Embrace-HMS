import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

export default function HeroSection() {
  return (
    <section
      id="hero-section"
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-white via-blue-gray/30 to-white pt-20"
    >
      {/* Subtle background pattern - heartbeat line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          className="absolute top-1/2 left-0 w-full h-40 -translate-y-1/2 animate-pulse-subtle"
          viewBox="0 0 1440 160"
          fill="none"
        >
          <path
            d="M0,80 L200,80 L220,80 L240,30 L260,130 L280,20 L300,140 L320,80 L340,80 L1440,80"
            stroke="#003580"
            strokeWidth="2"
            fill="none"
            opacity="0.06"
          />
        </svg>
        {/* Subtle medical crosses */}
        <div className="absolute top-20 right-20 w-16 h-16 opacity-[0.03]">
          <div className="absolute top-1/2 left-0 right-0 h-4 bg-navy -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 bottom-0 w-4 bg-navy -translate-x-1/2" />
        </div>
        <div className="absolute bottom-32 left-16 w-12 h-12 opacity-[0.03]">
          <div className="absolute top-1/2 left-0 right-0 h-3 bg-teal -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 bottom-0 w-3 bg-teal -translate-x-1/2" />
        </div>
        {/* Gradient orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-navy/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal/10 text-teal rounded-full text-sm font-semibold mb-6"
            >
              <span className="w-2 h-2 bg-teal rounded-full animate-pulse" />
              NABH Accredited Hospital
            </motion.div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              <span className="text-navy">Compassionate</span>
              <br />
              <span className="text-navy">Care.</span>{' '}
              <span className="bg-gradient-to-r from-teal to-teal-dark bg-clip-text text-transparent">
                Trusted
              </span>
              <br />
              <span className="bg-gradient-to-r from-teal to-teal-dark bg-clip-text text-transparent">
                Excellence.
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-lg lg:text-xl text-text-secondary max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              At Embrace Hospital, we combine cutting-edge medical technology with
              heartfelt compassion to deliver world-class healthcare you can trust.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              <Link
                to="/book-appointment"
                id="hero-book-appointment"
                className="group inline-flex items-center gap-2 px-7 py-4 text-base font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-2xl shadow-lg shadow-teal/25 hover:shadow-xl hover:shadow-teal/35 hover:-translate-y-0.5 transition-all duration-300"
              >
                Book Appointment
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                id="hero-learn-more"
                className="group inline-flex items-center gap-2 px-7 py-4 text-base font-semibold text-navy border-2 border-navy/15 rounded-2xl hover:border-navy/40 hover:bg-navy/5 transition-all duration-300"
              >
                <Play className="w-4 h-4" />
                Learn More
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-10 flex items-center gap-6 justify-center lg:justify-start"
            >
              <div className="flex -space-x-3">
                {['RS', 'AK', 'MP', 'SJ'].map((initials, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-navy to-teal flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div className="text-sm text-text-secondary">
                <span className="font-bold text-navy">10,000+</span> patients trust us
              </div>
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-navy/15">
              <img
                src="/images/hero-banner.png"
                alt="Embrace Hospital - Dedicated Team of Medical Professionals"
                className="w-full h-[400px] lg:h-[550px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/20 via-transparent to-transparent" />
            </div>

            {/* Floating card - 24/7 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute -bottom-5 -left-5 lg:-left-10 bg-white rounded-2xl p-4 shadow-xl shadow-navy/10 border border-navy/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal to-teal-dark rounded-xl flex items-center justify-center">
                  <span className="text-white font-heading font-bold text-sm">24/7</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-navy">Emergency Care</p>
                  <p className="text-xs text-text-light">Always Available</p>
                </div>
              </div>
            </motion.div>

            {/* Floating card - Accredited */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="absolute -top-4 -right-4 lg:-right-8 bg-white rounded-2xl p-4 shadow-xl shadow-navy/10 border border-navy/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-navy to-navy-light rounded-xl flex items-center justify-center">
                  <span className="text-white font-heading font-bold text-xs">NABH</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-navy">Accredited</p>
                  <p className="text-xs text-text-light">Quality Assured</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

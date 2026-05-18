import { useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock, X, CalendarPlus, Award } from 'lucide-react';
import allDoctors from '../data/doctors';

export default function DoctorsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [selected, setSelected] = useState(null);

  return (
    <section id="doctors-section" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-14"
        >
          <div>
            <span className="inline-block px-4 py-1.5 bg-teal/10 text-teal text-sm font-semibold rounded-full mb-4">
              Our Team
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-navy">
              Meet Our Doctors
            </h2>
            <p className="mt-3 text-lg text-text-secondary max-w-lg">
              Our team of expert physicians is committed to your health and well-being.
            </p>
          </div>
          <Link
            to="/doctors"
            id="see-all-doctors"
            className="group inline-flex items-center gap-2 mt-6 sm:mt-0 text-teal font-semibold hover:text-teal-dark transition-colors"
          >
            See All Doctors
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Horizontal scroll container */}
        <div className="overflow-x-auto pb-6 -mx-4 px-4 scrollbar-thin">
          <div className="flex gap-6 min-w-max">
            {allDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: Math.min(index * 0.08, 1) }}
                id={`doctor-${doctor.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="group w-64 lg:w-72 bg-white rounded-2xl border border-gray-100 hover:border-teal/30 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden shrink-0"
              >
                {/* Avatar */}
                <div className="p-6 pb-4 flex flex-col items-center">
                  <div
                    className={`w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br ${doctor.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform duration-300`}
                  >
                    <span className="text-white font-heading text-2xl lg:text-3xl font-bold">
                      {doctor.initials}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-navy text-center">
                    {doctor.name}
                  </h3>
                  <p className="text-teal font-medium text-sm mt-1">{doctor.specialization}</p>
                  <p className="text-text-light text-xs mt-1">{doctor.experience} experience</p>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 pt-2 flex gap-2">
                  <button
                    onClick={() => setSelected(doctor)}
                    className="flex-1 py-2.5 text-center text-sm font-semibold text-navy border-2 border-navy/15 rounded-xl hover:bg-navy hover:text-white hover:border-navy transition-all duration-300"
                  >
                    View Profile
                  </button>
                  <Link
                    to="/book-appointment"
                    className="flex-1 py-2.5 text-center text-sm font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-xl hover:shadow-lg hover:shadow-teal/25 transition-all duration-300"
                  >
                    Book
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Doctor Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelected(null)}
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
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                <div className="flex items-center gap-5">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${selected.gradient} flex items-center justify-center shadow-xl border-4 border-white/20`}>
                    <span className="text-white font-heading text-2xl font-bold">{selected.initials}</span>
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-white">{selected.name}</h3>
                    <span className="inline-block mt-1 px-3 py-1 bg-teal/90 text-white text-xs font-semibold rounded-full">{selected.specialization}</span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 space-y-5">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-9 h-9 rounded-xl bg-navy/5 flex items-center justify-center"><Award className="w-4 h-4 text-navy" /></div>
                  <div><p className="text-text-light text-xs">Experience</p><p className="font-semibold text-text-primary">{selected.experience}</p></div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-9 h-9 rounded-xl bg-navy/5 flex items-center justify-center"><MapPin className="w-4 h-4 text-navy" /></div>
                  <div><p className="text-text-light text-xs">Location</p><p className="font-semibold text-text-primary">{selected.room}</p></div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-9 h-9 rounded-xl bg-navy/5 flex items-center justify-center"><Clock className="w-4 h-4 text-navy" /></div>
                  <div><p className="text-text-light text-xs">Working Hours</p><p className="font-semibold text-text-primary">{selected.hours}</p></div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-heading font-bold text-navy text-sm mb-2">About</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">{selected.bio}</p>
                </div>
                <Link
                  to="/book-appointment"
                  className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  <CalendarPlus className="w-4 h-4" /> Book Appointment
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

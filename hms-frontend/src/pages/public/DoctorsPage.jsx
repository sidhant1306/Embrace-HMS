import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, X, CalendarPlus, Award } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import allDoctors from '../../data/doctors';

export default function DoctorsPage() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white to-blue-gray pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-navy mb-4">Our Doctors</h1>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">Meet our team of experienced and dedicated medical professionals.</p>
            <Link to="/" className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 text-sm font-semibold text-navy border border-navy/20 rounded-xl hover:bg-navy hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {allDoctors.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all text-center group">
                <div className={`w-18 h-18 rounded-full bg-gradient-to-br ${d.gradient} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                  <span className="text-white font-heading text-lg font-bold">{d.initials}</span>
                </div>
                <h3 className="font-heading text-base font-bold text-navy">{d.name}</h3>
                <p className="text-sm text-teal font-semibold mt-0.5">{d.specialization}</p>
                <p className="text-xs text-text-light mt-0.5">{d.experience} experience</p>
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelected(d); }}
                    className="flex-1 py-2 text-xs font-semibold text-navy border border-navy/15 rounded-xl hover:bg-navy/5 transition-colors"
                  >
                    View Details
                  </button>
                  <Link to="/book-appointment" className="flex-1 py-2 text-xs font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-xl hover:shadow-lg transition-all text-center">Book</Link>
                </div>
              </motion.div>
            ))}
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
                <div className="relative bg-gradient-to-br from-navy to-navy-light p-8 rounded-t-3xl">
                  <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
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
                  <Link to="/book-appointment" className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-2xl shadow-lg hover:shadow-xl transition-all">
                    <CalendarPlus className="w-4 h-4" /> Book Appointment
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}

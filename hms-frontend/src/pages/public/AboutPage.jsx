import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Award, Users, Clock, Shield, Sparkles, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white to-blue-gray">
        {/* Hero */}
        <section className="relative pt-32 pb-20 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal/10 text-teal rounded-full text-sm font-semibold mb-6">
                <Heart className="w-4 h-4" fill="currentColor" /> About Embrace Hospital
              </span>
              <h1 className="font-heading text-4xl lg:text-5xl font-bold text-navy mb-6">
                Caring for Your <span className="bg-gradient-to-r from-teal to-teal-dark bg-clip-text text-transparent">Health</span>,<br />One Life at a Time
              </h1>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                Embrace Hospital is a state-of-the-art healthcare facility committed to delivering compassionate, patient-centered care with the latest in medical technology.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Award, title: 'Excellence', desc: 'We strive for the highest standards in medical care, ensuring every patient receives the best treatment.' },
              { icon: Users, title: 'Compassion', desc: 'Our team treats every patient with empathy, dignity, and respect throughout their healing journey.' },
              { icon: Shield, title: 'Trust', desc: 'We build lasting relationships with our patients through transparency, integrity, and reliable care.' },
              { icon: Clock, title: '24/7 Care', desc: 'Our emergency services and critical care units operate around the clock, every day of the year.' },
              { icon: Sparkles, title: 'Innovation', desc: 'We continuously adopt the latest medical technologies and practices to improve patient outcomes.' },
              { icon: Heart, title: 'Wellness', desc: 'Beyond treatment, we focus on overall wellness, offering preventive care and health education programs.' },
            ].map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <v.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-heading text-lg font-bold text-navy mb-2">{v.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-2xl font-bold text-navy mb-4">Ready to Experience Exceptional Care?</h2>
            <p className="text-text-secondary mb-8">Book your appointment today and let our expert team take care of you.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/book-appointment" className="px-8 py-3 bg-gradient-to-r from-teal to-teal-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">Book Appointment</Link>
              <Link to="/" className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-text-secondary font-semibold rounded-xl hover:bg-gray-50 transition-colors"><ArrowLeft className="w-4 h-4" /> Back Home</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Brain, Bone, Eye, Baby, Activity, Stethoscope, Cross } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const DEPARTMENTS = [
  { name: 'Cardiology', desc: 'Heart and cardiovascular system', icon: Heart, color: 'from-red-500 to-rose-600' },
  { name: 'Neurology', desc: 'Brain and nervous system', icon: Brain, color: 'from-purple-500 to-violet-600' },
  { name: 'Orthopedics', desc: 'Bones, joints, and muscles', icon: Bone, color: 'from-amber-500 to-orange-600' },
  { name: 'Ophthalmology', desc: 'Eye care and vision', icon: Eye, color: 'from-cyan-500 to-blue-600' },
  { name: 'Pediatrics', desc: 'Children\'s healthcare', icon: Baby, color: 'from-pink-500 to-rose-500' },
  { name: 'Emergency', desc: '24/7 emergency services', icon: Activity, color: 'from-red-600 to-red-700' },
  { name: 'General Medicine', desc: 'Primary care and diagnosis', icon: Stethoscope, color: 'from-teal to-teal-dark' },
  { name: 'Surgery', desc: 'General and specialized surgeries', icon: Cross, color: 'from-navy to-navy-light' },
];

export default function DepartmentsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white to-blue-gray pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-navy mb-4">Our Departments</h1>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">Specialized departments equipped with modern facilities and expert medical professionals.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DEPARTMENTS.map((d, i) => (
              <motion.div key={d.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${d.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  <d.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-heading text-base font-bold text-navy mb-1">{d.name}</h3>
                <p className="text-sm text-text-secondary">{d.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

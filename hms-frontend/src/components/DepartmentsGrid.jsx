import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  HeartPulse,
  Brain,
  Bone,
  Baby,
  Ribbon,
  Eye,
  FlaskConical,
  Pill,
  Siren,
} from 'lucide-react';

const departments = [
  {
    name: 'Cardiology',
    description: 'Advanced heart care with state-of-the-art cardiac diagnostics and treatment.',
    icon: HeartPulse,
    color: 'from-red-500 to-rose-600',
  },
  {
    name: 'Neurology',
    description: 'Comprehensive neurological care for brain and nervous system disorders.',
    icon: Brain,
    color: 'from-purple-500 to-violet-600',
  },
  {
    name: 'Orthopedics',
    description: 'Expert bone and joint care with minimally invasive surgical techniques.',
    icon: Bone,
    color: 'from-amber-500 to-orange-600',
  },
  {
    name: 'Pediatrics',
    description: 'Gentle, specialized healthcare for infants, children, and adolescents.',
    icon: Baby,
    color: 'from-sky-400 to-blue-500',
  },
  {
    name: 'Oncology',
    description: 'Multidisciplinary cancer treatment with personalized therapy plans.',
    icon: Ribbon,
    color: 'from-pink-500 to-fuchsia-600',
  },
  {
    name: 'Ophthalmology',
    description: 'Complete eye care from routine checkups to complex surgeries.',
    icon: Eye,
    color: 'from-emerald-500 to-green-600',
  },
  {
    name: 'Pathology & Lab',
    description: 'Accurate diagnostics with advanced laboratory testing facilities.',
    icon: FlaskConical,
    color: 'from-cyan-500 to-teal-600',
  },
  {
    name: 'Pharmacy',
    description: '24/7 in-house pharmacy with a wide range of quality medications.',
    icon: Pill,
    color: 'from-indigo-500 to-blue-600',
  },
  {
    name: 'Emergency',
    description: 'Round-the-clock emergency services with rapid response capability.',
    icon: Siren,
    color: 'from-red-600 to-red-700',
  },
];

export default function DepartmentsGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="departments-section" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-teal/10 text-teal text-sm font-semibold rounded-full mb-4">
            Our Specialties
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-navy">
            Departments & Services
          </h2>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
            World-class medical care across 15+ specialties, powered by expert physicians
            and cutting-edge technology.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {departments.map((dept, index) => {
            const Icon = dept.icon;
            return (
              <motion.div
                key={dept.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                id={`dept-${dept.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="group relative bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 hover:border-teal/40 shadow-sm hover:shadow-xl hover:shadow-teal/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${dept.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading text-xl font-bold text-navy mb-2 group-hover:text-teal transition-colors">
                  {dept.name}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {dept.description}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal to-teal-light rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Cpu, Users, Headphones, BadgeDollarSign } from 'lucide-react';

const features = [
  {
    icon: Cpu,
    title: 'Advanced Technology',
    description:
      'Equipped with the latest medical technology including robotic surgery, AI diagnostics, and digital imaging systems.',
  },
  {
    icon: Users,
    title: 'Expert Specialists',
    description:
      'Our team of 50+ board-certified specialists bring decades of experience across all major medical disciplines.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description:
      'Round-the-clock patient support with emergency services, teleconsultation, and dedicated care coordinators.',
  },
  {
    icon: BadgeDollarSign,
    title: 'Affordable Care',
    description:
      'Transparent pricing with flexible payment plans, insurance tie-ups, and financial counseling for every patient.',
  },
];

export default function WhyChooseUs() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="why-choose-us" className="py-20 lg:py-28 bg-blue-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-navy/10 text-navy text-sm font-semibold rounded-full mb-4">
            Why Embrace Hospital
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-navy">
            Why Choose Us?
          </h2>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
            We go above and beyond to ensure every patient receives exceptional care
            in a nurturing environment.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                id={`feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="group bg-white rounded-2xl p-7 lg:p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white hover:border-teal/20"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-navy to-navy-light flex items-center justify-center mb-6 shadow-lg group-hover:from-teal group-hover:to-teal-dark transition-all duration-500">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-xl font-bold text-navy mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

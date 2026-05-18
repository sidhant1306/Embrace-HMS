import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const gallery = [
  {
    src: '/images/hospital-corridor.png',
    caption: 'Modern Facility',
    description: 'State-of-the-art corridors and patient areas',
  },
  {
    src: '/images/lab-report.png',
    caption: 'Advanced Diagnostics',
    description: 'Precision laboratory testing and reporting',
  },
  {
    src: '/images/surgery-ot.png',
    caption: 'Surgical Excellence',
    description: 'World-class operating theaters',
  },
];

export default function PhotoGallery() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="photo-gallery" className="py-20 lg:py-28 bg-soft-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-navy/10 text-navy text-sm font-semibold rounded-full mb-4">
            Gallery
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-navy">
            Our Facilities
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
          {gallery.map((item, index) => (
            <motion.div
              key={item.caption}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer"
            >
              <img
                src={item.src}
                alt={item.caption}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-navy/30 to-transparent group-hover:from-navy-dark/90 transition-all duration-300" />
              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-heading text-xl font-bold text-white mb-1">
                  {item.caption}
                </h3>
                <p className="text-white/70 text-sm group-hover:text-white/90 transition-colors">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

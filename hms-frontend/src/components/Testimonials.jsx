import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Ananya Rao',
    rating: 5,
    quote:
      'The entire team at Embrace Hospital made my heart surgery journey so much smoother. From pre-op consultations to post-surgery recovery, every step was handled with incredible care and professionalism.',
    department: 'Cardiology Patient',
  },
  {
    name: 'Vikram Joshi',
    rating: 5,
    quote:
      'I brought my daughter here for a pediatric emergency at 2 AM. The ER team was swift, compassionate, and thorough. We felt safe and well-cared for throughout. Highly recommend!',
    department: 'Emergency Care',
  },
  {
    name: 'Meera Kulkarni',
    rating: 4,
    quote:
      'Dr. Rajesh Kumar performed my knee replacement surgery. Three months later, I am walking without any pain. The physiotherapy team here is outstanding. Forever grateful!',
    department: 'Orthopedics Patient',
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="testimonials-section" className="py-20 lg:py-28 bg-blue-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-teal/10 text-teal text-sm font-semibold rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-navy">
            What Our Patients Say
          </h2>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
            Hear from the people who've experienced our commitment to excellence firsthand.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              id={`testimonial-${index}`}
              className="bg-white rounded-2xl p-7 lg:p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-white relative"
            >
              {/* Quote icon */}
              <Quote className="w-10 h-10 text-teal/15 absolute top-6 right-6" />

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonial.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200 fill-gray-200'
                    }`}
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-text-secondary text-sm leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-navy to-teal flex items-center justify-center">
                  <span className="text-white font-heading font-bold text-sm">
                    {testimonial.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </span>
                </div>
                <div>
                  <p className="font-heading font-bold text-navy text-sm">{testimonial.name}</p>
                  <p className="text-text-light text-xs">{testimonial.department}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

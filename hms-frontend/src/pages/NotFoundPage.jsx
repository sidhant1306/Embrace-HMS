import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NotFoundPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white to-blue-gray flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-lg"
        >
          {/* Big 404 */}
          <h1 className="font-heading text-8xl lg:text-9xl font-bold bg-gradient-to-r from-navy to-teal bg-clip-text text-transparent leading-none mb-4">
            404
          </h1>

          {/* Subtitle */}
          <h2 className="font-heading text-2xl lg:text-3xl font-bold text-navy mb-3">
            Page Not Found
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-teal to-teal-dark rounded-2xl shadow-lg shadow-teal/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="group inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-navy border-2 border-navy/15 rounded-2xl hover:bg-navy/5 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}

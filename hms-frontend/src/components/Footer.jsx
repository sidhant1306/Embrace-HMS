import { Link } from 'react-router-dom';
import {
  Heart,
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  MessageCircle,
  Camera,
  Briefcase,
  ArrowUp,
} from 'lucide-react';

const quickLinks = [
  { name: 'About Us', path: '/about' },
  { name: 'Departments', path: '/departments' },
  { name: 'Find a Doctor', path: '/doctors' },
  { name: 'Book Appointment', path: '/book-appointment' },
  { name: 'Patient Portal', path: '/login' },
  { name: 'Careers', path: '/careers' },
];

const socialLinks = [
  { icon: Globe, href: '#', label: 'Website' },
  { icon: MessageCircle, href: '#', label: 'Chat' },
  { icon: Camera, href: '#', label: 'Gallery' },
  { icon: Briefcase, href: '#', label: 'Careers' },
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="footer" className="bg-navy text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-teal to-teal-dark rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" fill="white" strokeWidth={0} />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-lg font-bold text-white leading-tight">
                  Embrace
                </span>
                <span className="text-[10px] font-semibold text-teal-light uppercase tracking-[0.2em] -mt-0.5">
                  Hospital
                </span>
              </div>
            </div>

            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm">
              Delivering world-class healthcare with compassion and innovation since 2005.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                <p className="text-white/70 text-sm">
                  123 Healthcare Avenue, Medical District,
                  <br />
                  Mumbai, Maharashtra 400001
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-teal shrink-0" />
                <div>
                  <p className="text-white/70 text-sm">+91 22 1234 5678</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-teal shrink-0" />
                <p className="text-white/70 text-sm">info@embracehospital.com</p>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <p className="text-white font-semibold text-sm">Emergency: +91 22 9999 0000</p>
                  <p className="text-white/50 text-xs">Available 24/7</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-white/60 text-sm hover:text-teal transition-colors hover:translate-x-1 inline-block transform"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-6 text-white">Stay Connected</h3>
            <p className="text-white/60 text-sm mb-6">
              Follow us on social media for health tips, news, and updates.
            </p>
            <div className="flex gap-3 mb-8">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    id={`social-${social.label.toLowerCase()}`}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-teal flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </a>
                );
              })}
            </div>

            {/* Working Hours */}
            <h4 className="font-heading font-semibold text-sm mb-3 text-white/80">
              Working Hours
            </h4>
            <div className="space-y-2 text-sm text-white/50">
              <div className="flex justify-between">
                <span>OPD Timing</span>
                <span className="text-white/70">9:00 AM – 8:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Emergency</span>
                <span className="text-teal font-semibold">24 × 7</span>
              </div>
              <div className="flex justify-between">
                <span>Pharmacy</span>
                <span className="text-white/70">24 × 7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-sm text-center sm:text-left">
            © {new Date().getFullYear()} Embrace Hospital. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            id="scroll-to-top"
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-teal flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </footer>
  );
}

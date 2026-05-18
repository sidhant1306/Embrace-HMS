import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSending(true);
    // Simulate sending the message (no backend endpoint for contact)
    setTimeout(() => {
      toast.success('Message sent successfully! We will get back to you soon.');
      setForm({ name: '', email: '', phone: '', message: '' });
      setSending(false);
    }, 1200);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white to-blue-gray pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-navy mb-4">Contact Us</h1>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">We'd love to hear from you. Reach out anytime.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
              {[
                { icon: MapPin, title: 'Address', lines: ['123 Healthcare Avenue', 'New Delhi, India 110001'] },
                { icon: Phone, title: 'Phone', lines: ['+91 11 2345 6789', 'Emergency: +91 11 2345 6700'] },
                { icon: Mail, title: 'Email', lines: ['info@embracehospital.com', 'appointments@embracehospital.com'] },
                { icon: Clock, title: 'Hours', lines: ['OPD: Mon-Sat 8AM-8PM', 'Emergency: 24/7'] },
              ].map((c) => (
                <div key={c.title} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center shrink-0 shadow-md">
                    <c.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-navy text-sm">{c.title}</h3>
                    {c.lines.map((l, j) => <p key={j} className="text-sm text-text-secondary">{l}</p>)}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="font-heading text-xl font-bold text-navy mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
                />
                <textarea
                  placeholder="Your Message *"
                  rows={4}
                  value={form.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none resize-none"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal to-teal-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
                >
                  {sending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Message</>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

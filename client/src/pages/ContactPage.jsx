import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

const ContactPage = () => {
  const { settings, showToast } = useApp();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Your message has been sent to our care team!');
  };

  return (
    <div className="w-full bg-white py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-muted">
            Customer Care & Inquiries
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary mt-1">
            Get in Touch
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-3">
            Have questions about an order, ingredients, or need personalized formulation advice? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* CONTACT INFO (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-brand-surface/60 p-8 rounded-2xl border border-brand-border space-y-6">
            <h3 className="font-serif text-xl font-bold text-brand-primary">Our Care Details</h3>
            
            <div className="space-y-4 text-xs sm:text-sm text-brand-muted">
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="text-brand-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-brand-text">Laboratory & Studio</p>
                  <p>{settings.contactAddress || 'Mumbai, Maharashtra'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail size={18} className="text-brand-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-brand-text">Email Support</p>
                  <a href={`mailto:${settings.contactEmail || 'support@smoothself.in'}`} className="text-brand-primary hover:underline">
                    {settings.contactEmail || 'support@smoothself.in'}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock size={18} className="text-brand-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-brand-text">Operating Hours</p>
                  <p>Monday to Saturday: 10:00 AM – 7:00 PM IST</p>
                  <p className="text-[11px] text-gray-400">Response time: Usually within 2 to 4 business hours.</p>
                </div>
              </div>
            </div>
          </div>

          {/* MESSAGE FORM (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-brand-border shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-serif text-xl font-bold text-brand-primary">Message Received!</h3>
                <p className="text-xs text-brand-muted max-w-sm mx-auto">
                  Thank you for reaching out. One of our formulation specialists will respond to your email within 4 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 bg-brand-surface text-brand-primary text-xs font-semibold rounded-lg border border-brand-border"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif text-xl font-bold text-brand-primary mb-2">Send Us a Message</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">Your Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. priya@example.com"
                      className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98200 12345"
                    className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">How can we assist you? *</label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write your query or question here..."
                    className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-lg shadow transition flex items-center space-x-2"
                >
                  <Send size={14} />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ContactPage;

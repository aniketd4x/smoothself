'use client';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';

const Footer = () => {
  const { settings, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    try {
      const res = await fetch('/api/settings/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setSubscribed(true);
        setEmail('');
        showToast(data.message || 'Subscribed successfully!');
      } else {
        showToast(data.message || 'Subscription failed', 'error');
      }
    } catch {
      showToast('Could not subscribe. Please try again.', 'error');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-brand-surface text-brand-text border-t border-brand-border mt-20">
      {/* 4-COLUMN FOOTER CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* COLUMN 1: NEWSLETTER (lg:col-span-5) */}
          <div className="lg:col-span-5">
            <div className="mb-5">
              <Link to="/">
                <img
                  src={settings.logoUrl || '/logo.webp'}
                  alt={settings.brandName || 'SmoothSelf'}
                  className="h-7 w-auto object-contain"
                />
              </Link>
            </div>
            <h3 className="font-serif text-2xl lg:text-3xl font-semibold text-brand-primary mb-3">
              {settings.newsletterHeading || 'Let’s get in touch'}
            </h3>
            <p className="text-brand-muted text-sm leading-relaxed mb-6 max-w-md">
              {settings.newsletterSubheading || 'Sign up with your email address to receive news and updates, special drops, and exclusive discounts.'}
            </p>

            {subscribed ? (
              <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg text-sm">
                <CheckCircle size={18} />
                <span>Thank you! You are subscribed to SmoothSelf updates.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 py-3 bg-white border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-primary transition"
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="px-6 py-3 bg-brand-primary hover:bg-brand-hover text-white text-sm font-medium rounded-lg transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  <span>{isSubscribing ? 'Subscribing...' : 'Subscribe now'}</span>
                  {!isSubscribing && <ArrowRight size={16} />}
                </button>
              </form>
            )}

            <div className="mt-8 flex items-center space-x-4 text-brand-muted">
              <a
                href={settings.instagramUrl || "https://instagram.com"}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-brand-border flex items-center justify-center hover:text-brand-primary hover:border-brand-primary transition"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a
                href={settings.facebookUrl || "https://facebook.com"}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-brand-border flex items-center justify-center hover:text-brand-primary hover:border-brand-primary transition"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z"/></svg>
              </a>
              <a
                href={settings.twitterUrl || "https://twitter.com"}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-brand-border flex items-center justify-center hover:text-brand-primary hover:border-brand-primary transition"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>

          {/* COLUMN 2: QUICK LINKS (lg:col-span-2) */}
          <div className="lg:col-span-2">
            <h4 className="font-serif text-lg font-semibold text-brand-primary mb-4">
              Quick links
            </h4>
            <ul className="space-y-2.5 text-sm text-brand-muted">
              <li>
                <Link to="/" className="hover:text-brand-primary transition">Home</Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-brand-primary transition">Shop All</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-primary transition">About us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-primary transition">Contact</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-brand-primary transition">Journal & Blog</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-brand-primary transition">FAQs</Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-brand-primary transition">Track Order</Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: LEGAL POLICIES (lg:col-span-2) */}
          <div className="lg:col-span-2">
            <h4 className="font-serif text-lg font-semibold text-brand-primary mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-brand-muted">
              <li>
                <Link to="/privacy-policy" className="hover:text-brand-primary transition">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-brand-primary transition">Refund Policy</Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-brand-primary transition">Shipping Policy</Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-brand-primary transition">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: OUR STORE (lg:col-span-3) */}
          <div className="lg:col-span-3">
            <h4 className="font-serif text-lg font-semibold text-brand-primary mb-4">
              Our store
            </h4>
            <p className="text-sm text-brand-muted leading-relaxed mb-3">
              {settings.contactAddress || 'Mumbai, Maharashtra'}
            </p>
            <p className="text-sm text-brand-muted mb-1.5">
              <span className="font-medium text-brand-text">Email: </span>
              <a href={`mailto:${settings.contactEmail || 'support@smoothself.in'}`} className="hover:text-brand-primary">
                {settings.contactEmail || 'support@smoothself.in'}
              </a>
            </p>
            <p className="text-sm text-brand-muted mb-4">
              <span className="font-medium text-brand-text">Helpline: </span>
              <a href={`tel:${settings.contactPhone || '+91 99604 42750'}`} className="hover:text-brand-primary">
                {settings.contactPhone || '+91 99604 42750'}
              </a>
            </p>
            <div className="text-xs text-brand-muted bg-white border border-brand-border p-3 rounded-lg">
              <p className="font-medium text-brand-text mb-1">Customer Support Hours:</p>
              <p>Monday – Saturday: 10:00 AM – 7:00 PM IST</p>
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM BAR: COPYRIGHT & BADGES */}
      <div className="border-t border-brand-border bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-brand-muted text-center md:text-left">
            <span>© {new Date().getFullYear()} {settings.brandName || 'SmoothSelf'}. All rights reserved.</span>
            <span className="mx-2">•</span>
            <Link to="/admin/login" className="hover:text-brand-primary inline-flex items-center space-x-1">
              <ShieldCheck size={13} />
              <span>Admin Portal</span>
            </Link>
          </div>

          {/* Secure Payment Badges */}
          <div className="flex items-center space-x-2 text-xs text-brand-muted">
            <span className="px-2.5 py-1 bg-brand-surface rounded border border-brand-border font-medium">UPI</span>
            <span className="px-2.5 py-1 bg-brand-surface rounded border border-brand-border font-medium">RuPay</span>
            <span className="px-2.5 py-1 bg-brand-surface rounded border border-brand-border font-medium">Visa</span>
            <span className="px-2.5 py-1 bg-brand-surface rounded border border-brand-border font-medium">Mastercard</span>
            <span className="px-2.5 py-1 bg-brand-surface rounded border border-brand-border font-medium">NetBanking</span>
            <span className="px-2.5 py-1 bg-brand-surface rounded border border-brand-border font-medium">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

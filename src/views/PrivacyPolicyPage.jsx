'use client';
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ChevronRight, Mail, MapPin, Lock, FileText, RefreshCw, Truck, Phone } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const { settings } = useApp();
  const supportEmail = settings.contactEmail || 'support@smoothself.in';
  const address = settings.contactAddress || 'Mumbai, Maharashtra';

  return (
    <div className="w-full bg-white py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-brand-muted mb-6">
          <Link to="/" className="hover:text-brand-primary transition">Home</Link>
          <ChevronRight size={13} />
          <span className="text-brand-primary font-semibold">Privacy Policy</span>
        </nav>

        {/* Page Header */}
        <div className="border-b border-brand-border pb-8 mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-surface text-brand-primary text-xs font-semibold uppercase tracking-wider mb-4 border border-brand-border">
            <Lock size={13} />
            <span>Legal & Data Protection</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-3">
            Last Updated: October 2026 • Effective Date: Immediate
          </p>
        </div>

        {/* Policy Quick Nav */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-10 text-xs">
          <Link to="/privacy-policy" className="p-3 rounded-xl bg-brand-primary text-white text-center font-semibold shadow-sm">
            Privacy Policy
          </Link>
          <Link to="/refund-policy" className="p-3 rounded-xl bg-brand-surface hover:bg-brand-primary/10 text-brand-primary text-center font-semibold border border-brand-border transition">
            Refund Policy
          </Link>
          <Link to="/shipping-policy" className="p-3 rounded-xl bg-brand-surface hover:bg-brand-primary/10 text-brand-primary text-center font-semibold border border-brand-border transition">
            Shipping Policy
          </Link>
          <Link to="/terms-of-service" className="p-3 rounded-xl bg-brand-surface hover:bg-brand-primary/10 text-brand-primary text-center font-semibold border border-brand-border transition">
            Terms of Service
          </Link>
        </div>

        {/* Summary Callout Box */}
        <div className="bg-brand-surface/70 border border-brand-border rounded-2xl p-6 mb-12">
          <h3 className="font-serif text-base font-bold text-brand-primary mb-2 flex items-center space-x-2">
            <ShieldCheck className="text-emerald-600" size={18} />
            <span>Our Commitment to Your Privacy</span>
          </h3>
          <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
            At <strong>SmoothSelf</strong>, we prioritize the confidentiality and protection of your personal information. We do not sell, trade, or rent your personal data to third parties. All payments are processed through RBI-compliant, 256-bit bank-grade encrypted gateways.
          </p>
        </div>

        {/* Policy Content Sections */}
        <div className="space-y-10 text-xs sm:text-sm text-brand-muted leading-relaxed">
          
          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              1. Introduction
            </h2>
            <p className="mb-3">
              This Privacy Policy describes how <strong>SmoothSelf</strong> ("we", "us", or "our"), with registered operational operations in <strong>{address}</strong>, collects, utilizes, safeguards, and discloses your personal data when you visit our website, browse our botanical product catalog, create an account, or purchase our self-care formulas.
            </p>
            <p>
              By accessing our website and ordering our products, you consent to the data practices and procedures described in this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              2. Information We Collect
            </h2>
            <p className="mb-3">
              We collect information that you directly provide to us, as well as data automatically gathered during your visits:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Contact & Identity Details:</strong> Full name, telephone/mobile number, and email address collected during registration, newsletter signups, or checkout.
              </li>
              <li>
                <strong>Shipping & Delivery Details:</strong> Physical delivery address, apartment/suite number, city, state, postal code, and delivery landmarks for order fulfillment.
              </li>
              <li>
                <strong>Transaction & Payment Information:</strong> Payment method selected (UPI, Credit/Debit Card, Net Banking, or Cash on Delivery). <em>Please note: We do not store credit card numbers, CVVs, or bank net-banking passwords. All payment transactions are executed securely via certified, RBI-licensed payment gateways.</em>
              </li>
              <li>
                <strong>Technical & Device Data:</strong> IP address, browser type, operating system, pages viewed, time spent on pages, and device identifiers to optimize website speed and security.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              3. How We Use Your Information
            </h2>
            <p className="mb-3">We use your information strictly for legitimate commercial and customer care purposes:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To confirm, process, pack, and ship your orders swiftly from our Mumbai hub.</li>
              <li>To send you automated dispatch notifications, SMS/WhatsApp delivery updates, and tracking links.</li>
              <li>To offer responsive customer support, process replacement requests, and answer skincare inquiries via <a href={`mailto:${supportEmail}`} className="text-brand-primary underline font-medium">{supportEmail}</a>.</li>
              <li>To detect, prevent, and mitigate fraudulent orders, unauthorized chargebacks, or suspicious activities.</li>
              <li>To send occasional product announcements, discounts, or routine self-care tips (only if you opted in, with an easy 1-click unsubscribe option).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              4. Data Sharing & Third-Party Service Providers
            </h2>
            <p className="mb-3">
              SmoothSelf does not sell, rent, or monetize your personal data. We disclose your information only to essential, trusted partners under strict confidentiality agreements:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Logistics & Courier Partners:</strong> Third-party courier providers (e.g., Shiprocket, Delhivery, Bluedart) solely to deliver your orders to your doorstep.
              </li>
              <li>
                <strong>Payment Aggregators:</strong> Secure payment gateways to authenticate and process payments in compliance with Indian banking regulations.
              </li>
              <li>
                <strong>Legal & Statutory Compliance:</strong> If required by Indian law, court order, or governmental authorities to comply with statutory legal obligations.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              5. Cookies and Web Analytics
            </h2>
            <p>
              We use functional cookies and session tokens to remember items in your shopping cart, maintain your logged-in state, and evaluate general website traffic trends. You can manage or disable cookies via your browser settings at any time, though disabling cookies may affect your cart and checkout experience.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              6. Data Security & Storage
            </h2>
            <p>
              We deploy industry-standard technical, operational, and organizational security measures—including TLS/SSL encryption, secure token-based authentication, and restricted database access—to protect your personal information against unauthorized access, loss, or alteration.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              7. Your Rights & Choices
            </h2>
            <p className="mb-3">As a SmoothSelf customer, you have full control over your personal data:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You may review, update, or edit your delivery address and account details at any time in your Account portal.</li>
              <li>You may request complete deletion of your account and personal records by contacting our support team.</li>
              <li>You may opt out of promotional emails by clicking "Unsubscribe" in any marketing email.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              8. Contact & Grievance Redressal
            </h2>
            <p className="mb-3">
              For any queries, concerns, or requests regarding this Privacy Policy or your personal information, please write to our dedicated support desk:
            </p>
            <div className="bg-brand-surface p-5 rounded-xl border border-brand-border space-y-2">
              <div className="flex items-center space-x-2 text-brand-text font-semibold">
                <Mail size={15} className="text-brand-primary" />
                <span>Support Email: <a href={`mailto:${supportEmail}`} className="text-brand-primary underline">{supportEmail}</a></span>
              </div>
              <div className="flex items-center space-x-2 text-brand-text font-semibold">
                <MapPin size={15} className="text-brand-primary" />
                <span>Operating Address: {address}</span>
              </div>
              <p className="text-[11px] text-brand-muted mt-2">
                Response time: We strive to acknowledge and resolve all data inquiries within 24 to 48 business hours.
              </p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

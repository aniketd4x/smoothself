'use client';
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { RefreshCw, ChevronRight, Mail, MapPin, CheckCircle, Clock, AlertCircle, HelpCircle, Phone } from 'lucide-react';

const RefundPolicyPage = () => {
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
          <span className="text-brand-primary font-semibold">Refund & Return Policy</span>
        </nav>

        {/* Page Header */}
        <div className="border-b border-brand-border pb-8 mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-surface text-brand-primary text-xs font-semibold uppercase tracking-wider mb-4 border border-brand-border">
            <RefreshCw size={13} />
            <span>Returns & Cancellations</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary tracking-tight">
            Refund & Return Policy
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-3">
            Last Updated: October 2026 • 30-Day Hassle-Free Confidence Guarantee
          </p>
        </div>

        {/* Policy Quick Nav */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-10 text-xs">
          <Link to="/privacy-policy" className="p-3 rounded-xl bg-brand-surface hover:bg-brand-primary/10 text-brand-primary text-center font-semibold border border-brand-border transition">
            Privacy Policy
          </Link>
          <Link to="/refund-policy" className="p-3 rounded-xl bg-brand-primary text-white text-center font-semibold shadow-sm">
            Refund Policy
          </Link>
          <Link to="/shipping-policy" className="p-3 rounded-xl bg-brand-surface hover:bg-brand-primary/10 text-brand-primary text-center font-semibold border border-brand-border transition">
            Shipping Policy
          </Link>
          <Link to="/terms-of-service" className="p-3 rounded-xl bg-brand-surface hover:bg-brand-primary/10 text-brand-primary text-center font-semibold border border-brand-border transition">
            Terms of Service
          </Link>
        </div>

        {/* Key Highlights Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-brand-surface/70 border border-brand-border rounded-xl p-5 text-center">
            <Clock size={24} className="text-brand-primary mx-auto mb-2" />
            <h4 className="font-bold text-brand-primary text-xs sm:text-sm mb-1">30 Days Window</h4>
            <p className="text-[11px] text-brand-muted">Initiate returns or exchange within 30 days of receiving your package.</p>
          </div>
          <div className="bg-brand-surface/70 border border-brand-border rounded-xl p-5 text-center">
            <CheckCircle size={24} className="text-emerald-600 mx-auto mb-2" />
            <h4 className="font-bold text-brand-primary text-xs sm:text-sm mb-1">Free Damaged Replacements</h4>
            <p className="text-[11px] text-brand-muted">Instant free replacement if bottle is damaged or leaking during transit.</p>
          </div>
          <div className="bg-brand-surface/70 border border-brand-border rounded-xl p-5 text-center">
            <RefreshCw size={24} className="text-brand-primary mx-auto mb-2" />
            <h4 className="font-bold text-brand-primary text-xs sm:text-sm mb-1">Quick Bank/UPI Payout</h4>
            <p className="text-[11px] text-brand-muted">Refunds credited within 5-7 business days after return verification.</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10 text-xs sm:text-sm text-brand-muted leading-relaxed">
          
          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              1. Our 30-Day Satisfaction Promise
            </h2>
            <p className="mb-3">
              At <strong>SmoothSelf</strong>, we take enormous pride in our clean, skin-loving formulations and premium body care lotions. If for any reason you are not completely satisfied with your purchase, we offer a straightforward, customer-first <strong>30-Day Return & Replacement Policy</strong>.
            </p>
            <p>
              You have 30 calendar days from the date your shipment is delivered according to courier tracking records to request a return, refund, or product exchange.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              2. Return & Exchange Eligibility
            </h2>
            <p className="mb-3">To qualify for a standard return and full refund:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Hygiene Standards:</strong> Because our formulations are personal cosmetic and body care items, bottles must remain unused, unaltered, and with safety seal or outer pump shrink-wrap intact (unless being reported for defective packaging or damage upon delivery).
              </li>
              <li>
                <strong>Original Packaging:</strong> Products must be returned in their original packaging, including protective outer boxes and any bundled complimentary gifts.
              </li>
              <li>
                <strong>Proof of Purchase:</strong> You must provide the original order number or invoice received from SmoothSelf.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              3. Damaged, Defective, or Incorrect Items
            </h2>
            <p className="mb-3">
              While every order is inspected and secured in bubble wrap at our Mumbai fulfillment center before dispatch, accidental shipping mishandling can occasionally happen. If your parcel arrives damaged, leaking, broken, or contains an incorrect variant:
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 mb-4">
              <div className="flex items-start space-x-2">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">Report within 48 hours:</h4>
                  <p className="text-[11px] mt-0.5">
                    Please take clear photographs or a short video showing the outer shipping box, shipping label, and damaged product, then email them to <a href={`mailto:${supportEmail}`} className="underline font-bold">{supportEmail}</a> within 48 hours of delivery.
                  </p>
                </div>
              </div>
            </div>
            <p>
              Once verified by our care desk, we will immediately dispatch a <strong>brand new free replacement</strong> at zero extra charge to you, or initiate a 100% full refund if you prefer.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              4. Step-by-Step Return Process
            </h2>
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <strong>Submit Your Request:</strong> Email us at <a href={`mailto:${supportEmail}`} className="text-brand-primary underline font-medium">{supportEmail}</a> with the subject line <em>"Return Request - [Your Order ID]"</em>, stating your reason and attaching photos if relevant.
              </li>
              <li>
                <strong>Approval & Reverse Pickup:</strong> Our team will review your request within 24 hours. Once approved, we will arrange a reverse pickup via our logistics partners directly from your delivery address.
              </li>
              <li>
                <strong>Packaging the Item:</strong> Safely pack the product in its original box with adequate cushioning so it travels securely back to our Mumbai warehouse.
              </li>
              <li>
                <strong>Inspection & Refund:</strong> Upon receiving and inspecting the returned item at our Mumbai hub, our quality control team will process your refund or dispatch your replacement within 24–48 hours.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              5. Refund Timeline & Payment Modes
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Prepaid Orders (UPI, Cards, Net Banking):</strong> Refunds are credited automatically back to the original source account/card within <strong>5 to 7 business days</strong> depending on your issuing bank.
              </li>
              <li>
                <strong>Cash on Delivery (COD) Orders:</strong> If your order was paid in cash upon delivery, our care team will share a secure payout link or request your bank account/UPI ID to transfer the full refund directly to your bank account.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              6. Order Cancellations
            </h2>
            <p>
              You can cancel an order free of charge at any time before it has been dispatched from our Mumbai facility. To cancel, please email <a href={`mailto:${supportEmail}`} className="text-brand-primary underline">{supportEmail}</a> or reply to your order confirmation email immediately. If the order has already been picked up by the courier, it cannot be canceled in flight, but you may refuse delivery or request a return once it reaches you.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              7. Customer Support & Return Hub
            </h2>
            <div className="bg-brand-surface p-5 rounded-xl border border-brand-border space-y-2">
              <div className="flex items-center space-x-2 text-brand-text font-semibold">
                <Mail size={15} className="text-brand-primary" />
                <span>Support Email: <a href={`mailto:${supportEmail}`} className="text-brand-primary underline">{supportEmail}</a></span>
              </div>
              <div className="flex items-center space-x-2 text-brand-text font-semibold">
                <Phone size={15} className="text-brand-primary" />
                <span>Helpline / WhatsApp: <a href={`tel:${settings.contactPhone || '+91 99604 42750'}`} className="text-brand-primary underline">{settings.contactPhone || '+91 99604 42750'}</a></span>
              </div>
              <div className="flex items-center space-x-2 text-brand-text font-semibold">
                <MapPin size={15} className="text-brand-primary" />
                <span>Return Hub Address: {address}</span>
              </div>
              <p className="text-[11px] text-brand-muted mt-2">
                We are committed to making your shopping experience entirely risk-free. Feel free to contact us anytime with questions.
              </p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};

export default RefundPolicyPage;

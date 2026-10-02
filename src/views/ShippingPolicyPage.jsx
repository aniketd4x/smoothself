'use client';
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Truck, ChevronRight, Mail, MapPin, CheckCircle, Clock, PackageCheck, AlertTriangle, Phone } from 'lucide-react';

const ShippingPolicyPage = () => {
  const { settings } = useApp();
  const supportEmail = settings.contactEmail || 'support@smoothself.in';
  const address = settings.contactAddress || 'Mumbai, Maharashtra';
  const freeThreshold = settings.freeShippingThreshold || 450;
  const standardFee = settings.standardShippingFee || 50;

  return (
    <div className="w-full bg-white py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-brand-muted mb-6">
          <Link to="/" className="hover:text-brand-primary transition">Home</Link>
          <ChevronRight size={13} />
          <span className="text-brand-primary font-semibold">Shipping Policy</span>
        </nav>

        {/* Page Header */}
        <div className="border-b border-brand-border pb-8 mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-surface text-brand-primary text-xs font-semibold uppercase tracking-wider mb-4 border border-brand-border">
            <Truck size={13} />
            <span>Fulfillment & Logistics</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary tracking-tight">
            Shipping & Delivery Policy
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-3">
            Last Updated: October 2026 • Fast, Reliable Doorstep Delivery Across India
          </p>
        </div>

        {/* Policy Quick Nav */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-10 text-xs">
          <Link to="/privacy-policy" className="p-3 rounded-xl bg-brand-surface hover:bg-brand-primary/10 text-brand-primary text-center font-semibold border border-brand-border transition">
            Privacy Policy
          </Link>
          <Link to="/refund-policy" className="p-3 rounded-xl bg-brand-surface hover:bg-brand-primary/10 text-brand-primary text-center font-semibold border border-brand-border transition">
            Refund Policy
          </Link>
          <Link to="/shipping-policy" className="p-3 rounded-xl bg-brand-primary text-white text-center font-semibold shadow-sm">
            Shipping Policy
          </Link>
          <Link to="/terms-of-service" className="p-3 rounded-xl bg-brand-surface hover:bg-brand-primary/10 text-brand-primary text-center font-semibold border border-brand-border transition">
            Terms of Service
          </Link>
        </div>

        {/* Highlight Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-brand-surface/70 border border-brand-border rounded-xl p-5 text-center">
            <PackageCheck size={24} className="text-emerald-600 mx-auto mb-2" />
            <h4 className="font-bold text-brand-primary text-xs sm:text-sm mb-1">Free Delivery &gt; ₹{freeThreshold}</h4>
            <p className="text-[11px] text-brand-muted">Complimentary shipping automatically applied on all orders above ₹{freeThreshold}.</p>
          </div>
          <div className="bg-brand-surface/70 border border-brand-border rounded-xl p-5 text-center">
            <Clock size={24} className="text-brand-primary mx-auto mb-2" />
            <h4 className="font-bold text-brand-primary text-xs sm:text-sm mb-1">24–48 Hr Dispatch</h4>
            <p className="text-[11px] text-brand-muted">Orders are freshly packed and dispatched within 24 to 48 business hours.</p>
          </div>
          <div className="bg-brand-surface/70 border border-brand-border rounded-xl p-5 text-center">
            <Truck size={24} className="text-brand-primary mx-auto mb-2" />
            <h4 className="font-bold text-brand-primary text-xs sm:text-sm mb-1">Pan-India Express</h4>
            <p className="text-[11px] text-brand-muted">Delivered to 25,000+ pin codes across India with live GPS tracking.</p>
          </div>
        </div>

        {/* Detailed Shipping Sections */}
        <div className="space-y-10 text-xs sm:text-sm text-brand-muted leading-relaxed">
          
          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              1. Shipping Coverage & Pan-India Network
            </h2>
            <p className="mb-3">
              <strong>SmoothSelf</strong> delivers to over 25,000 pin codes across every state and union territory in India. All shipments originate directly from our central fulfillment and distribution center based in <strong>{address}</strong>, ensuring maximum freshness and optimal quality handling of our botanical formulations.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              2. Order Processing & Dispatch Timelines
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Processing Schedule:</strong> Orders are verified and packaged for dispatch within <strong>24 to 48 business hours</strong> (Monday through Saturday, excluding public holidays).
              </li>
              <li>
                <strong>Weekend & Holiday Orders:</strong> Orders placed on Sunday or national holidays are dispatched on the next business working day.
              </li>
              <li>
                <strong>Quality Inspection:</strong> Each lotion bottle undergoes bottle integrity checks, seal verification, and multi-layer shockproof packing prior to handover to courier partners.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              3. Delivery Timelines by Region
            </h2>
            <div className="overflow-x-auto my-4 border border-brand-border rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-brand-surface text-brand-primary border-b border-brand-border font-bold">
                    <th className="p-3.5">Destination Zone</th>
                    <th className="p-3.5">Key Cities / Regions</th>
                    <th className="p-3.5">Estimated Delivery Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  <tr>
                    <td className="p-3.5 font-semibold text-brand-text">Mumbai & Maharashtra</td>
                    <td className="p-3.5">Mumbai, Thane, Pune, Navi Mumbai, Nashik</td>
                    <td className="p-3.5 text-emerald-700 font-semibold">1 – 2 Business Days</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-brand-text">Tier 1 Metro Cities</td>
                    <td className="p-3.5">Delhi-NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Ahmedabad</td>
                    <td className="p-3.5 font-semibold">2 – 4 Business Days</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-brand-text">Tier 2 & Tier 3 Cities</td>
                    <td className="p-3.5">All major districts & suburban towns across India</td>
                    <td className="p-3.5">3 – 5 Business Days</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold text-brand-text">Remote / North-East / J&K</td>
                    <td className="p-3.5">Special transit corridors and regional outposts</td>
                    <td className="p-3.5">5 – 7 Business Days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-brand-muted italic">
              * Note: Unforeseen regional weather disturbances, festive delivery surges, or local containment restrictions may occasionally cause minor courier delays beyond our control.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              4. Shipping Rates & Thresholds
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Free Standard Shipping:</strong> Every order with a cart value of <strong>₹{freeThreshold} or higher</strong> automatically qualifies for 100% Free Shipping throughout India.
              </li>
              <li>
                <strong>Standard Delivery Fee:</strong> For orders below ₹{freeThreshold}, a flat nominal shipping fee of <strong>₹{standardFee}</strong> is added at checkout to cover courier freight.
              </li>
              <li>
                <strong>Transparent Pricing:</strong> There are zero hidden fees, octroi charges, or packing surcharges. What you see at checkout is the final price.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              5. Live Order Tracking
            </h2>
            <p className="mb-3">
              The moment your package is collected by our courier partner, you will receive an automatic dispatch notification via SMS and Email containing:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Assigned Logistics Partner Name (e.g. Delhivery, Bluedart, Xpressbees).</li>
              <li>Your Air Waybill (AWB) Tracking Number.</li>
              <li>A direct 1-click live tracking link to observe real-time parcel transit checkpoints.</li>
            </ul>
            <p className="mt-3">
              You can also track your shipment anytime on our website using our dedicated <Link to="/track-order" className="text-brand-primary underline font-medium">Order Tracking Page</Link>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              6. Cash on Delivery (COD) Guidelines
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Cash on Delivery is available for most serviceable pin codes across India.</li>
              <li>To prevent misrouted packages, an automated confirmation SMS or telephone verification may precede dispatch for first-time COD buyers.</li>
              <li>Please ensure exact cash or UPI digital payment is ready when the courier delivery executive arrives at your doorstep.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              7. Non-Delivery & Failed Delivery Attempts
            </h2>
            <p>
              Our courier partners attempt delivery up to three (3) consecutive times. If the recipient is unavailable or the phone number provided is unreachable, the parcel will be held at the nearest courier hub for 48 hours before returning to our Mumbai center. If your package is returning, please reach out immediately to <a href={`mailto:${supportEmail}`} className="text-brand-primary underline">{supportEmail}</a> so we can arrange prompt re-dispatch.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              8. Logistics & Fulfillment Inquiries
            </h2>
            <div className="bg-brand-surface p-5 rounded-xl border border-brand-border space-y-2">
              <div className="flex items-center space-x-2 text-brand-text font-semibold">
                <Mail size={15} className="text-brand-primary" />
                <span>Shipping Support Desk: <a href={`mailto:${supportEmail}`} className="text-brand-primary underline">{supportEmail}</a></span>
              </div>
              <div className="flex items-center space-x-2 text-brand-text font-semibold">
                <Phone size={15} className="text-brand-primary" />
                <span>Helpline / WhatsApp: <a href={`tel:${settings.contactPhone || '+91 99604 42750'}`} className="text-brand-primary underline">{settings.contactPhone || '+91 99604 42750'}</a></span>
              </div>
              <div className="flex items-center space-x-2 text-brand-text font-semibold">
                <MapPin size={15} className="text-brand-primary" />
                <span>Central Fulfillment Hub: {address}</span>
              </div>
              <p className="text-[11px] text-brand-muted mt-2">
                Need urgent assistance with an in-transit parcel? Our dispatch coordination team is available Monday to Saturday, 10:00 AM to 7:00 PM IST.
              </p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};

export default ShippingPolicyPage;

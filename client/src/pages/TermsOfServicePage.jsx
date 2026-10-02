import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FileText, ChevronRight, Mail, MapPin, ShieldAlert, Award, Scale, HelpCircle } from 'lucide-react';

const TermsOfServicePage = () => {
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
          <span className="text-brand-primary font-semibold">Terms of Service</span>
        </nav>

        {/* Page Header */}
        <div className="border-b border-brand-border pb-8 mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-surface text-brand-primary text-xs font-semibold uppercase tracking-wider mb-4 border border-brand-border">
            <Scale size={13} />
            <span>Store Terms & Conditions</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-3">
            Last Updated: October 2026 • Legal Terms Governing Website Use & Purchases
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
          <Link to="/shipping-policy" className="p-3 rounded-xl bg-brand-surface hover:bg-brand-primary/10 text-brand-primary text-center font-semibold border border-brand-border transition">
            Shipping Policy
          </Link>
          <Link to="/terms-of-service" className="p-3 rounded-xl bg-brand-primary text-white text-center font-semibold shadow-sm">
            Terms of Service
          </Link>
        </div>

        {/* Legal Advisory Note */}
        <div className="bg-brand-surface/70 border border-brand-border rounded-2xl p-6 mb-12">
          <h3 className="font-serif text-base font-bold text-brand-primary mb-2 flex items-center space-x-2">
            <Award className="text-brand-primary" size={18} />
            <span>SmoothSelf Store Terms Overview</span>
          </h3>
          <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
            Welcome to <strong>SmoothSelf</strong>. These Terms of Service outline the rules, obligations, and legal agreements governing your visit to our website and the purchase of our personal care and skincare formulations. By browsing or purchasing from our platform, you agree to comply with and be bound by these terms.
          </p>
        </div>

        {/* Detailed Terms Sections */}
        <div className="space-y-10 text-xs sm:text-sm text-brand-muted leading-relaxed">
          
          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              1. General E-Commerce Store Conditions
            </h2>
            <p className="mb-3">
              This website is operated by <strong>SmoothSelf</strong>, with registered operations in <strong>{address}</strong>. Throughout the site, the terms "we", "us", and "our" refer to SmoothSelf.
            </p>
            <p>
              By visiting our platform, browsing products, or purchasing items from us, you engage in our "Service" and agree to be bound by these Terms of Service, along with our <Link to="/privacy-policy" className="text-brand-primary underline">Privacy Policy</Link>, <Link to="/refund-policy" className="text-brand-primary underline">Refund Policy</Link>, and <Link to="/shipping-policy" className="text-brand-primary underline">Shipping Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              2. Eligibility & Account Security
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>By agreeing to these Terms, you represent that you are at least the age of majority in your state of residence, or that you have given parental consent for any minor dependents to use this site.</li>
              <li>You agree to provide true, accurate, current, and complete information during checkout and account registration.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials and are solely liable for all activities occurring under your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              3. Products, Botanical Formulations & Advisory
            </h2>
            <p className="mb-3">
              Our body lotions, creams, and personal care products are crafted using botanical oils, clean extracts, and clinical actives. We make every reasonable effort to display product colors, textures, and details with exact precision.
            </p>
            <div className="bg-brand-surface p-4 rounded-xl border border-brand-border space-y-2 mb-3">
              <h4 className="font-bold text-xs text-brand-primary flex items-center space-x-2">
                <ShieldAlert size={15} />
                <span>Cosmetic Usage & Patch Test Advisory</span>
              </h4>
              <p className="text-xs">
                All SmoothSelf products are for external, topical personal care use only. Because individual skin types and allergies vary, we strongly advise conducting a 24-hour small skin patch test on your forearm prior to broad application. If irritation occurs, discontinue use immediately.
              </p>
            </div>
            <p>
              We reserve the right to limit the sales of our products to any person, geographic region, or jurisdiction at our discretion.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              4. Pricing, Taxes & Billing Accuracy
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>All prices listed on our website are in <strong>Indian Rupees (₹)</strong> and are inclusive of all statutory Goods and Services Taxes (GST).</li>
              <li>Prices for our products are subject to revision without prior notice. Promotional coupon discounts cannot be clubbed unless explicitly permitted.</li>
              <li>We reserve the right to refuse or cancel any order placed with erroneous pricing or inventory errors. If your card or UPI account has already been debited, a full refund will be immediately issued.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              5. Intellectual Property Rights
            </h2>
            <p>
              All content on this website—including but not limited to brand names, trade dress, "SmoothSelf" trademarks, logos, copy, custom graphic illustrations, images, product bottle photography, and software code—is the proprietary property of SmoothSelf and protected under Indian and international intellectual property laws. Reproduction, imitation, distribution, or commercial exploitation without prior written consent is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              6. Prohibited Uses
            </h2>
            <p className="mb-3">You are prohibited from using the site or its content:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts.</li>
              <li>To violate any national, federal, provincial, or state regulations, rules, or laws.</li>
              <li>To transmit any malicious code, viruses, automated bots, scrapers, or spyware.</li>
              <li>To harvest or track personal information of other website users without authorization.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              7. Governing Law & Dispute Resolution
            </h2>
            <p className="mb-3">
              These Terms of Service and any separate agreements whereby we provide you products or services shall be governed by and construed in accordance with the substantive laws of <strong>India</strong>.
            </p>
            <p>
              Any disputes, claims, or controversies arising out of or relating to these Terms, orders placed, or product use shall be subject to the exclusive jurisdiction of the competent courts situated in <strong>Mumbai, Maharashtra</strong>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-brand-primary mb-3">
              8. Contact & Legal Inquiries
            </h2>
            <p className="mb-3">
              Questions regarding these Terms of Service or regulatory notices should be addressed to our legal and customer desk:
            </p>
            <div className="bg-brand-surface p-5 rounded-xl border border-brand-border space-y-2">
              <div className="flex items-center space-x-2 text-brand-text font-semibold">
                <Mail size={15} className="text-brand-primary" />
                <span>Legal & Support Desk: <a href={`mailto:${supportEmail}`} className="text-brand-primary underline">{supportEmail}</a></span>
              </div>
              <div className="flex items-center space-x-2 text-brand-text font-semibold">
                <MapPin size={15} className="text-brand-primary" />
                <span>Headquarters: {address}</span>
              </div>
              <p className="text-[11px] text-brand-muted mt-2">
                Operational Hours: Monday through Saturday, 10:00 AM – 7:00 PM IST.
              </p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};

export default TermsOfServicePage;

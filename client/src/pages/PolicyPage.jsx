import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ChevronRight } from 'lucide-react';

const PolicyPage = () => {
  const { policyType } = useParams();
  const { settings } = useApp();

  let title = 'Store Policy';
  let content = '';

  switch (policyType) {
    case 'privacy':
      title = 'Privacy Policy';
      content = settings.privacyPolicy || 'We take your privacy seriously. All personal information collected during checkout or account creation is encrypted and safeguarded. We do not sell, rent, or share customer data with third parties. Payment credentials are processed via RBI-compliant, 256-bit encrypted gateways.';
      break;
    case 'refund':
      title = 'Refund, Return & Exchange Policy';
      content = settings.refundPolicy || 'We offer 30-Day Hassle-Free Returns. Return or exchange your order within 30 days of delivery. Shop with complete confidence and peace of mind on every order.';
      break;
    case 'shipping':
      title = 'Shipping Policy';
      content = settings.shippingPolicy || 'Orders are dispatched within 24 to 48 business hours. Delivery timelines are 2-5 business days across India. Free shipping applies automatically to all orders above ₹450. For orders below ₹450, a standard delivery fee of ₹50 applies.';
      break;
    case 'terms':
      title = 'Terms of Service';
      content = settings.termsOfService || 'By purchasing from our store, you agree to our terms of service, which govern the sale of products and use of our e-commerce platform. All brand content, formulas, logos, and materials are copyrighted by the company.';
      break;
    default:
      title = 'Terms & Policies';
      content = 'Please contact customer care for any specific inquiries regarding our policies.';
  }

  return (
    <div className="w-full bg-white py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <nav className="flex items-center space-x-2 text-xs text-brand-muted mb-6">
          <Link to="/" className="hover:text-brand-primary">Home</Link>
          <ChevronRight size={13} />
          <span className="text-brand-primary font-semibold">{title}</span>
        </nav>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-primary mb-8 pb-4 border-b border-brand-border">
          {title}
        </h1>

        <div className="prose prose-slate text-xs sm:text-sm text-brand-muted leading-relaxed space-y-4">
          <p>{content}</p>
          <div className="p-4 bg-brand-surface rounded-xl border border-brand-border mt-8">
            <h4 className="font-bold text-brand-primary text-xs mb-1">Need Clarification?</h4>
            <p className="text-xs">
              Reach our legal & customer care desk at <a href={`mailto:${settings.contactEmail || 'care@smoothself.in'}`} className="text-brand-primary underline">{settings.contactEmail || 'care@smoothself.in'}</a>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PolicyPage;

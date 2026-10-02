import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import PrivacyPolicyPage from './PrivacyPolicyPage';
import RefundPolicyPage from './RefundPolicyPage';
import ShippingPolicyPage from './ShippingPolicyPage';
import TermsOfServicePage from './TermsOfServicePage';

const PolicyPage = () => {
  const { policyType } = useParams();

  switch (policyType) {
    case 'privacy':
    case 'privacy-policy':
      return <PrivacyPolicyPage />;
    case 'refund':
    case 'refund-policy':
    case 'returns':
      return <RefundPolicyPage />;
    case 'shipping':
    case 'shipping-policy':
    case 'delivery':
      return <ShippingPolicyPage />;
    case 'terms':
    case 'terms-of-service':
    case 'terms-and-conditions':
      return <TermsOfServicePage />;
    default:
      return <Navigate to="/privacy-policy" replace />;
  }
};

export default PolicyPage;

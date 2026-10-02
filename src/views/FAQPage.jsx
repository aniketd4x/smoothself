'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetch('/api/faqs')
      .then(r => r.json())
      .then(data => {
        if (data.success) setFaqs(data.faqs);
      })
      .catch(console.error);
  }, []);

  const categories = ['All', ...new Set(faqs.map(f => f.category))];

  const filteredFaqs = selectedCategory === 'All'
    ? faqs
    : faqs.filter(f => f.category === selectedCategory);

  return (
    <div className="w-full bg-white py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-12">
          <HelpCircle size={36} className="mx-auto text-brand-primary mb-3" />
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-primary">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-2">
            Everything you need to know about our formulations, orders, deliveries, and return policies.
          </p>
        </div>

        {/* Category Tabs */}
        {categories.length > 2 && (
          <div className="flex justify-center space-x-2 mb-8 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-brand-primary text-white'
                    : 'bg-brand-surface text-brand-text hover:bg-brand-border/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* FAQ Accordions */}
        <div className="divide-y divide-brand-border border border-brand-border rounded-2xl overflow-hidden bg-white shadow-sm">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={faq._id || idx} className="p-5 sm:p-6 transition">
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full flex items-center justify-between text-left font-serif text-base sm:text-lg font-bold text-brand-primary"
                >
                  <span>{faq.question}</span>
                  {isOpen ? <ChevronUp size={20} className="text-brand-primary flex-shrink-0 ml-4" /> : <ChevronDown size={20} className="text-brand-muted flex-shrink-0 ml-4" />}
                </button>
                {isOpen && (
                  <p className="mt-3 text-xs sm:text-sm text-brand-muted leading-relaxed animate-fade-in">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default FAQPage;

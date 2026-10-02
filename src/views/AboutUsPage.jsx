'use client';
import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Droplets, Leaf, ShieldCheck, Heart } from 'lucide-react';

const AboutUsPage = () => {
  const { settings } = useApp();

  return (
    <div className="w-full bg-white py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-muted">
            Our Origin & Philosophy
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary leading-tight">
            {settings.aboutUsTitle || 'The Purest Botanicals. The Softest Skin.'}
          </h1>
          <p className="text-sm sm:text-base text-brand-muted leading-relaxed">
            {settings.aboutUsText || 'SmoothSelf was created to redefine mindful self-care. We craft ultra-nourishing, lightweight personal care products infused with restorative botanical extracts, plant oils, and clinical actives like Vitamin E to reveal soft, glowing, hydrated skin every single day.'}
          </p>
        </div>

        {/* Brand visual showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 items-center">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-brand-border bg-brand-surface">
            <img
              src="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop"
              alt="Botanical Extraction"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-4">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">
              Uncompromising Quality
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-primary leading-snug">
              Formulated for Indian Weather & Skin Needs
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              Traditional body butters often leave a heavy, occlusive layer that melts uncomfortably in humid climates. Our bio-emulsion technology blends cold-pressed sweet almond lipids and plant squalane so they absorb deeply into the dermis within 30 seconds.
            </p>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              You get 48 hours of supple moisture with a velvety matte touch, allowing you to dress immediately without greasy stains on your clothes.
            </p>
          </div>
        </div>

        {/* 4 Pillars of Clean Beauty */}
        <div className="bg-brand-surface/50 p-8 sm:p-12 rounded-2xl border border-brand-border">
          <h3 className="font-serif text-2xl font-bold text-brand-primary text-center mb-10">
            Our Four Clean Beauty Pillars
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-brand-border text-center space-y-2">
              <Leaf size={28} className="mx-auto text-emerald-600 mb-2" />
              <h4 className="font-serif text-base font-bold text-brand-primary">100% Vegan</h4>
              <p className="text-xs text-brand-muted">Crafted exclusively with sustainable plant extracts, wild herbs, and clean actives.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-brand-border text-center space-y-2">
              <Heart size={28} className="mx-auto text-rose-600 mb-2" />
              <h4 className="font-serif text-base font-bold text-brand-primary">Cruelty-Free</h4>
              <p className="text-xs text-brand-muted">Never tested on animals. Tested on human volunteers for dermatological safety.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-brand-border text-center space-y-2">
              <Droplets size={28} className="mx-auto text-blue-600 mb-2" />
              <h4 className="font-serif text-base font-bold text-brand-primary">Clean Actives</h4>
              <p className="text-xs text-brand-muted">Zero parabens, artificial dyes, phthalates, silicones, or mineral oils.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-brand-border text-center space-y-2">
              <ShieldCheck size={28} className="mx-auto text-purple-600 mb-2" />
              <h4 className="font-serif text-base font-bold text-brand-primary">pH 5.5 Balanced</h4>
              <p className="text-xs text-brand-muted">Protects the natural acid mantle of sensitive Indian skin barriers.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUsPage;

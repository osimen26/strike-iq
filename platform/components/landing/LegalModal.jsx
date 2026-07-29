"use client";
import React, { useEffect } from 'react';

export default function LegalModal({ isOpen, onClose, type }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const content = {
    terms: (
      <div className="space-y-8">
        <h1 className="text-3xl font-mono font-bold text-white mb-2 uppercase tracking-tight">Terms and Conditions</h1>
        <p className="text-sm text-zinc-500">Last Updated: July 2026</p>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
          <p className="text-zinc-300 leading-relaxed text-sm">
            By accessing and using StrikeIQ ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our Service. You must be at least 18 years of age to use this Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">2. Not Betting or Financial Advice</h2>
          <p className="text-zinc-300 leading-relaxed text-sm">
            <strong className="text-red-400">CRITICAL DISCLAIMER:</strong> StrikeIQ is a data intelligence and analytics platform. The AI models, predictions, and analysis provided are for informational and entertainment purposes only. We do not guarantee profits, and our predictions do not constitute financial or betting advice. You are solely responsible for any financial decisions you make. Never stake more money than you can afford to lose.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">3. Subscriptions and Payments</h2>
          <p className="text-zinc-300 leading-relaxed text-sm">
            Access to certain features requires a paid subscription. Payments are processed securely via third-party providers (e.g., Flutterwave). By subscribing, you authorize us to charge your selected payment method on a recurring basis. You may cancel your subscription at any time through your dashboard. Refunds are granted at our sole discretion, and generally, we do not offer refunds for partially used billing periods.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">4. Acceptable Use and Account Termination</h2>
          <p className="text-zinc-300 leading-relaxed text-sm">
            You agree not to share your account credentials, scrape data from our platform, or resell our AI predictions. We reserve the right to suspend or terminate your account immediately, without prior notice or refund, if we suspect a violation of these terms or fraudulent activity.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">5. Limitation of Liability</h2>
          <p className="text-zinc-300 leading-relaxed text-sm">
            To the maximum extent permitted by law, StrikeIQ and its creators shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use or inability to use the Service, including but not limited to financial losses incurred through betting.
          </p>
        </section>
      </div>
    ),
    privacy: (
      <div className="space-y-8">
        <h1 className="text-3xl font-mono font-bold text-white mb-2 uppercase tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-zinc-500">Last Updated: July 2026</p>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">1. Information We Collect</h2>
          <p className="text-zinc-300 leading-relaxed text-sm">
            We collect information that you provide directly to us when creating an account, such as your email address and name. We also collect usage data (how you interact with our platform) and location data (IP address) to provide regional pricing and localize your experience.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">2. How We Use Your Information</h2>
          <p className="text-zinc-300 leading-relaxed text-sm">
            We use your information to provide, maintain, and improve StrikeIQ. This includes processing transactions, sending account notifications, personalizing the content you see (like regional pricing tiers), and analyzing platform usage to improve our AI models.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">3. Third-Party Services</h2>
          <p className="text-zinc-300 leading-relaxed text-sm">
            We do not sell your personal data. We may share necessary information with trusted third-party service providers (such as Flutterwave for secure payment processing) solely for the purpose of operating our Service. These providers are bound by strict confidentiality agreements.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">4. Data Security</h2>
          <p className="text-zinc-300 leading-relaxed text-sm">
            We implement commercially reasonable security measures to protect your personal information from unauthorized access, alteration, or disclosure. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">5. Your Rights</h2>
          <p className="text-zinc-300 leading-relaxed text-sm">
            Depending on your location, you may have the right to request access to, correction of, or deletion of your personal data. You can manage your account information directly from your dashboard or contact us for assistance.
          </p>
        </section>
      </div>
    ),
    cookies: (
      <div className="space-y-8">
        <h1 className="text-3xl font-mono font-bold text-white mb-2 uppercase tracking-tight">Cookie Policy</h1>
        <p className="text-sm text-zinc-500">Last Updated: July 2026</p>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">1. What Are Cookies?</h2>
          <p className="text-zinc-300 leading-relaxed text-sm">
            Cookies are small text files that are placed on your device when you visit our platform. They help us remember your preferences, keep you logged in securely, and understand how you interact with StrikeIQ so we can improve your experience.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">2. How We Use Cookies</h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-300 text-sm leading-relaxed">
            <li>
              <strong className="text-white">Essential Cookies:</strong> These are required to operate our platform, such as keeping you authenticated in the dashboard and securely processing your subscriptions.
            </li>
            <li>
              <strong className="text-white">Functionality Cookies:</strong> We use these to remember your preferences (like regional currency formatting) to provide a localized experience.
            </li>
            <li>
              <strong className="text-white">Analytics & Performance Cookies:</strong> These allow us to recognize and count the number of visitors and see how they move around the site, helping us improve our UI and performance.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">3. Third-Party Cookies</h2>
          <p className="text-zinc-300 leading-relaxed text-sm">
            We may also allow trusted third-party partners (such as analytics providers or payment gateways) to set cookies on your device to assist with the services they provide to StrikeIQ.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">4. Managing Your Cookies</h2>
          <p className="text-zinc-300 leading-relaxed text-sm">
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept essential cookies, you may not be able to use the authenticated areas of the StrikeIQ platform, such as the AI predictions dashboard.
          </p>
        </section>
      </div>
    )
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" style={{ fontFamily: 'var(--font-main)' }}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-[#09090b] border border-zinc-800/60 shadow-2xl rounded-2xl overflow-hidden max-h-[85vh] flex flex-col z-10">
        
        {/* Header / Close button */}
        <div className="flex justify-end p-4 shrink-0 absolute top-0 right-0 z-20">
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {content[type]}
        </div>

        {/* Bottom Fade Gradient for style */}
        <div className="h-10 bg-gradient-to-t from-[#09090b] to-transparent absolute bottom-0 left-0 right-0 pointer-events-none" />
      </div>
    </div>
  );
}

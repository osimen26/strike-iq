export default function PrivacyPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-mono font-bold text-white mb-2 uppercase tracking-tight">Privacy Policy</h1>
      <p className="text-sm text-zinc-500">Last Updated: July 2026</p>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
        <p>
          We collect information that you provide directly to us when creating an account, such as your email address and name. We also collect usage data (how you interact with our platform) and location data (IP address) to provide regional pricing and localize your experience.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">2. How We Use Your Information</h2>
        <p>
          We use your information to provide, maintain, and improve StrikeIQ. This includes processing transactions, sending account notifications, personalizing the content you see (like regional pricing tiers), and analyzing platform usage to improve our AI models.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">3. Third-Party Services</h2>
        <p>
          We do not sell your personal data. We may share necessary information with trusted third-party service providers (such as Flutterwave for secure payment processing) solely for the purpose of operating our Service. These providers are bound by strict confidentiality agreements.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">4. Data Security</h2>
        <p>
          We implement commercially reasonable security measures to protect your personal information from unauthorized access, alteration, or disclosure. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">5. Your Rights</h2>
        <p>
          Depending on your location, you may have the right to request access to, correction of, or deletion of your personal data. You can manage your account information directly from your dashboard or contact us for assistance.
        </p>
      </section>
    </div>
  );
}

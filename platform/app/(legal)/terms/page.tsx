export default function TermsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-mono font-bold text-white mb-2 uppercase tracking-tight">Terms and Conditions</h1>
      <p className="text-sm text-zinc-500">Last Updated: July 2026</p>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
        <p>
          By accessing and using StrikeIQ ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our Service. You must be at least 18 years of age to use this Service.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">2. Not Betting or Financial Advice</h2>
        <p>
          <strong>CRITICAL DISCLAIMER:</strong> StrikeIQ is a data intelligence and analytics platform. The AI models, predictions, and analysis provided are for informational and entertainment purposes only. We do not guarantee profits, and our predictions do not constitute financial or betting advice. You are solely responsible for any financial decisions you make. Never stake more money than you can afford to lose.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">3. Subscriptions and Payments</h2>
        <p>
          Access to certain features requires a paid subscription. Payments are processed securely via third-party providers (e.g., Flutterwave). By subscribing, you authorize us to charge your selected payment method on a recurring basis. You may cancel your subscription at any time through your dashboard. Refunds are granted at our sole discretion, and generally, we do not offer refunds for partially used billing periods.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">4. Acceptable Use and Account Termination</h2>
        <p>
          You agree not to share your account credentials, scrape data from our platform, or resell our AI predictions. We reserve the right to suspend or terminate your account immediately, without prior notice or refund, if we suspect a violation of these terms or fraudulent activity.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">5. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, StrikeIQ and its creators shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use or inability to use the Service, including but not limited to financial losses incurred through betting.
        </p>
      </section>
    </div>
  );
}

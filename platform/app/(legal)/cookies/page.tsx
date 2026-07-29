export default function CookiePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-mono font-bold text-white mb-2 uppercase tracking-tight">Cookie Policy</h1>
      <p className="text-sm text-zinc-500">Last Updated: July 2026</p>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">1. What Are Cookies?</h2>
        <p>
          Cookies are small text files that are placed on your device when you visit our platform. They help us remember your preferences, keep you logged in securely, and understand how you interact with StrikeIQ so we can improve your experience.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">2. How We Use Cookies</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Essential Cookies:</strong> These are required to operate our platform, such as keeping you authenticated in the dashboard and securely processing your subscriptions.
          </li>
          <li>
            <strong>Functionality Cookies:</strong> We use these to remember your preferences (like regional currency formatting) to provide a localized experience.
          </li>
          <li>
            <strong>Analytics & Performance Cookies:</strong> These allow us to recognize and count the number of visitors and see how they move around the site, helping us improve our UI and performance.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">3. Third-Party Cookies</h2>
        <p>
          We may also allow trusted third-party partners (such as analytics providers or payment gateways) to set cookies on your device to assist with the services they provide to StrikeIQ.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">4. Managing Your Cookies</h2>
        <p>
          You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept essential cookies, you may not be able to use the authenticated areas of the StrikeIQ platform, such as the AI predictions dashboard.
        </p>
      </section>
    </div>
  );
}

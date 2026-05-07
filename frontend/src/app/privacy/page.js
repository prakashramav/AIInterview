export default function PrivacyPage() {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12 prose prose-invert">
      <h1 className="text-4xl font-black mb-8">Privacy Policy</h1>
      <p className="text-foreground/60 mb-6">Last updated: May 7, 2026</p>
      
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
        <p>Welcome to [Company Name]. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">2. Data We Collect</h2>
        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Identity Data: name, username.</li>
          <li>Contact Data: email address.</li>
          <li>Technical Data: IP address, browser type, and version.</li>
          <li>Usage Data: information about how you use our website.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">3. How We Use Your Data</h2>
        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to provide the services you requested, to manage your account, and to improve our platform.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">4. Contact Us</h2>
        <p>If you have any questions about this privacy policy, please contact us at support@example.com.</p>
      </section>
    </div>
  );
}

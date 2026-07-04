import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — TicketWave KE",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-green-400 text-sm hover:underline mb-6 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: July 2026</p>

        <div className="flex flex-col gap-8 text-gray-400 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-lg mb-2">1. Information We Collect</h2>
            <p>
              When you create an account, browse events, or purchase a ticket on TicketWave KE, we collect
              information such as your name, email address, phone number, and payment details necessary to
              process your transaction. If you sign up using Google, we receive your name and email from
              your Google account.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
              <li>Process ticket purchases and send confirmations</li>
              <li>Communicate with you about your orders, account, or events you've shown interest in</li>
              <li>Verify M-Pesa payments through Safaricom's Daraja platform</li>
              <li>Improve our platform and the events we recommend to you</li>
              <li>Respond to support requests submitted through our contact form</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">3. Payment Information</h2>
            <p>
              Payments made via M-Pesa are processed directly through Safaricom's Daraja API. We do not
              store your M-Pesa PIN or full financial account details — we only retain transaction references
              (such as the M-Pesa receipt number) needed to confirm your order.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">4. Sharing Your Information</h2>
            <p>
              We do not sell your personal information. We may share limited information with event
              organizers (such as your name and ticket type) so they can manage attendance at their event,
              and with service providers (such as Supabase for data storage and Safaricom for payments)
              strictly to operate the platform.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">5. Data Security</h2>
            <p>
              We use industry-standard practices to protect your data, including encrypted connections and
              access controls on our database. However, no online platform can guarantee absolute security,
              and we encourage you to use a strong, unique password for your account.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">6. Your Rights</h2>
            <p>
              You can request access to, correction of, or deletion of your personal data at any time by
              contacting us through our <Link href="/contact" className="text-green-400 hover:underline">Contact page</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Significant changes will be reflected by
              updating the "Last updated" date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">8. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please reach out via our{" "}
              <Link href="/contact" className="text-green-400 hover:underline">Contact page</Link>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

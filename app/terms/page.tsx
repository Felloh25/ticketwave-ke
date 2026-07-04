import Link from "next/link";

export const metadata = {
  title: "Terms of Service — TicketWave KE",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-green-400 text-sm hover:underline mb-6 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: July 2026</p>

        <div className="flex flex-col gap-8 text-gray-400 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-lg mb-2">1. Acceptance of Terms</h2>
            <p>
              By creating an account, browsing events, or purchasing a ticket on TicketWave KE, you agree
              to be bound by these Terms of Service. If you do not agree, please do not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">2. Ticket Purchases</h2>
            <p>
              All ticket sales are between you and the event organizer; TicketWave KE facilitates the
              transaction and payment processing. Prices are listed in Kenyan Shillings (KES) unless stated
              otherwise. Once a payment is confirmed via M-Pesa, your ticket is considered booked.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">3. Refunds and Cancellations</h2>
            <p>
              Refund eligibility depends on the individual event organizer's policy. If an event is
              cancelled or rescheduled by the organizer, TicketWave KE will make reasonable efforts to
              notify ticket holders and assist with the refund process where applicable. TicketWave KE is
              not responsible for losses resulting from an organizer's decision to cancel or change an event.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">4. Event Planner Submissions</h2>
            <p>
              If you submit an event through our Planners page, you confirm that you have the right to list
              the event and that all details provided (date, location, pricing, images) are accurate. We
              reserve the right to review, edit, reject, or remove any submitted event at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">5. Account Responsibility</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for
              all activity that occurs under your account. Notify us immediately if you suspect unauthorized
              access to your account.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">6. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside mt-2 flex flex-col gap-1">
              <li>Use the platform for any unlawful purpose</li>
              <li>Attempt to interfere with or disrupt the platform's security or functionality</li>
              <li>Submit false, misleading, or fraudulent event listings</li>
              <li>Resell tickets in violation of an event organizer's stated policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">7. Limitation of Liability</h2>
            <p>
              TicketWave KE is provided "as is." We do our best to keep the platform accurate and available,
              but we are not liable for indirect or consequential damages arising from your use of the
              platform, including issues caused by third-party services such as Safaricom M-Pesa or Google
              sign-in.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">8. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the platform after changes are
              posted constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-2">9. Contact Us</h2>
            <p>
              Questions about these Terms can be sent via our{" "}
              <Link href="/contact" className="text-green-400 hover:underline">Contact page</Link>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

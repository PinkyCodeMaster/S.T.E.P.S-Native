import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1 max-w-2xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">
        S.T.E.P.S
      </h1>

      <p className="text-lg mb-6">
        A calmer way to get out of debt.
      </p>

      <p className="mb-6">
        S.T.E.P.S exists to help people who are overwhelmed by money, debt,
        and complicated systems feel safe enough to take control again.
        No judgement. No pressure. Just clear steps forward.
      </p>

      <div className="text-left space-y-4 mb-8">
        <p><strong>S — Survive Debt</strong><br />Stabilise essentials and stop things spiralling.</p>
        <p><strong>T — Take Control</strong><br />See what’s coming in, going out, and what’s safe.</p>
        <p><strong>E — Establish Wealth</strong><br />Build sustainable progress when you’re ready.</p>
        <p><strong>P — Protect Family</strong><br />Reduce stress and protect stability at home.</p>
        <p><strong>S — Secure Legacy</strong><br />Create a calmer future beyond debt.</p>
      </div>

      <p className="mb-6">
        If something goes wrong, we don’t judge.
        We help you fix it — calmly.
      </p>

      <p>
        You can read more about how S.T.E.P.S works in{' '}
        <Link href="/docs" className="font-medium underline">
          the documentation
        </Link>.
      </p>
    </div>
  );
}

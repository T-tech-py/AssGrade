import Link from 'next/link';

const footerLinks = [
  { href: '#', label: 'Privacy Policy' },
  { href: '#', label: 'Terms' },
  { href: '#', label: 'Contact' },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--landing-section-border)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold tracking-tight">GradAssess AI</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Graduate Employability Assessment Platform
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-[var(--muted)]">
          {footerLinks.map((link) => (
            <Link key={link.label} href={link.href} className="transition hover:text-[var(--foreground)]">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

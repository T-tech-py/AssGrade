import Link from 'next/link';

type FormFooterLinkProps = {
  text: string;
  linkText: string;
  href: string;
};

export function FormFooterLink({ text, linkText, href }: FormFooterLinkProps) {
  return (
    <p className="pt-1 text-center text-sm text-[var(--auth-muted-text)]">
      {text}{' '}
      <Link href={href} className="font-semibold text-[var(--dashboard-accent-foreground)] transition hover:opacity-80">
        {linkText}
      </Link>
    </p>
  );
}

import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

type LegalLayoutProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
  footerText: string;
  footerLink: string;
  footerTo: string;
};

export const LegalLayout = ({
  eyebrow,
  title,
  children,
  footerText,
  footerLink,
  footerTo,
}: LegalLayoutProps) => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    }
  }, [hash]);

  return (
    <div className="legal-page">
      <header className="legal-topbar">
        <div className="legal-topbar__inner">
          <Link
            aria-label="AI Mentor home"
            className="legal-brand-link"
            to="/login"
          >
            <span aria-hidden="true" className="legal-brand-mark">
              A
            </span>
            <span className="legal-brand">AI Mentor</span>
          </Link>
          <span className="legal-topbar__label">Legal</span>
        </div>
      </header>
      <main className="legal-content">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="legal-meta">
          AI Mentor · Effective date: November 14, 2026
        </p>
        {children}
        <footer className="legal-footer">
          <span>{footerText}</span>
          <Link to={footerTo}>{footerLink}</Link>
        </footer>
      </main>
    </div>
  );
};

'use client';

import { ReactNode } from 'react';
import { useHomeAuth } from './HomeAuthContext';

/** Button that opens auth modal */
export function AuthCTAButton({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { setShowAuth } = useHomeAuth();
  return (
    <button onClick={() => setShowAuth(true)} className={className} style={style}>
      {children}
    </button>
  );
}

/** Button that scrolls to a section by ID */
export function ScrollButton({
  to,
  children,
  className,
  style,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const handleClick = () => {
    document.getElementById(to)?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <button onClick={handleClick} className={className} style={style}>
      {children}
    </button>
  );
}

/** Button that opens welcome guide */
export function WelcomeGuideButton({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { setWelcomeGuideOpen } = useHomeAuth();
  return (
    <button onClick={() => setWelcomeGuideOpen(true)} className={className} style={style}>
      {children}
    </button>
  );
}

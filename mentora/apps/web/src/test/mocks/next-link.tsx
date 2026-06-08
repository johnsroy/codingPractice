import React from 'react';

interface MockLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

export default function MockLink({ href, children, className, ...rest }: MockLinkProps) {
  return (
    <a href={href} className={className} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
      {children}
    </a>
  );
}

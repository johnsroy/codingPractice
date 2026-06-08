import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  as?: React.ElementType;
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Soft, rounded card — the primary content container in Mentora.
 */
export function Card({
  children,
  className,
  padding = 'md',
  hover = false,
  as: Tag = 'div',
  onClick,
}: CardProps) {
  return (
    <Tag
      onClick={onClick}
      className={clsx(
        'bg-white rounded-xl shadow-card border border-surface-200',
        paddingClasses[padding],
        hover &&
          'transition-shadow duration-200 hover:shadow-hover cursor-pointer',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={clsx('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx('', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('mt-6 pt-4 border-t border-surface-200', className)}>
      {children}
    </div>
  );
}

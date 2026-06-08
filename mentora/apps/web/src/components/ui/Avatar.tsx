import React from 'react';
import clsx from 'clsx';
import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl',
};

const sizePixels = { sm: 32, md: 48, lg: 64, xl: 96 };

/** Gets initials from a name string. */
function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Deterministic hue from name for background color. */
function getHue(name?: string): number {
  if (!name) return 240;
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const px = sizePixels[size];
  const hue = getHue(name);

  return (
    <div
      className={clsx(
        'relative rounded-full overflow-hidden flex items-center justify-center flex-shrink-0',
        'font-semibold text-white select-none',
        sizeClasses[size],
        className,
      )}
      style={!src ? { backgroundColor: `hsl(${hue}, 60%, 50%)` } : undefined}
      aria-label={name ? `Avatar for ${name}` : 'User avatar'}
    >
      {src ? (
        <Image
          src={src}
          alt={name ? `${name}'s photo` : 'User photo'}
          width={px}
          height={px}
          className="object-cover w-full h-full"
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </div>
  );
}

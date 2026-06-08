import React from 'react';

interface MockImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function MockImage({ src, alt, width, height, className }: MockImageProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} width={width} height={height} className={className} />;
}

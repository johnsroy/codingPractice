import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders as a <span> element', () => {
    render(<Badge>Label</Badge>);
    expect(screen.getByText('Label').tagName).toBe('SPAN');
  });

  it('applies brand variant classes by default', () => {
    render(<Badge>Brand</Badge>);
    expect(screen.getByText('Brand').className).toMatch(/bg-brand-100/);
  });

  it('applies teal variant classes', () => {
    render(<Badge variant="teal">Teal</Badge>);
    expect(screen.getByText('Teal').className).toMatch(/bg-teal-100/);
  });

  it('applies amber variant classes', () => {
    render(<Badge variant="amber">Amber</Badge>);
    expect(screen.getByText('Amber').className).toMatch(/bg-amber-100/);
  });

  it('applies green variant classes', () => {
    render(<Badge variant="green">Green</Badge>);
    expect(screen.getByText('Green').className).toMatch(/bg-green-100/);
  });

  it('applies red variant classes', () => {
    render(<Badge variant="red">Red</Badge>);
    expect(screen.getByText('Red').className).toMatch(/bg-red-100/);
  });

  it('applies stone variant classes', () => {
    render(<Badge variant="stone">Stone</Badge>);
    expect(screen.getByText('Stone').className).toMatch(/bg-stone-100/);
  });

  it('applies outline variant classes', () => {
    render(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText('Outline').className).toMatch(/border-brand-500/);
  });

  it('applies sm size classes by default', () => {
    render(<Badge>Small</Badge>);
    expect(screen.getByText('Small').className).toMatch(/text-xs/);
  });

  it('applies md size classes when size="md"', () => {
    render(<Badge size="md">Medium</Badge>);
    expect(screen.getByText('Medium').className).toMatch(/text-sm/);
  });

  it('merges extra className', () => {
    render(<Badge className="my-custom-class">Custom</Badge>);
    expect(screen.getByText('Custom').className).toMatch(/my-custom-class/);
  });
});

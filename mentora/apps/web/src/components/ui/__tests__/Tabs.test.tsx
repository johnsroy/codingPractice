import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from '../Tabs';

const SAMPLE_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'lessons', label: 'Lessons' },
  { id: 'reviews', label: 'Reviews' },
];

function renderContent(active: string) {
  return <p data-testid="panel-content">{`Panel: ${active}`}</p>;
}

describe('Tabs', () => {
  it('renders all tab buttons', () => {
    render(<Tabs tabs={SAMPLE_TABS}>{renderContent}</Tabs>);
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Lessons' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Reviews' })).toBeInTheDocument();
  });

  it('activates the first tab by default', () => {
    render(<Tabs tabs={SAMPLE_TABS}>{renderContent}</Tabs>);
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('panel-content')).toHaveTextContent('Panel: overview');
  });

  it('activates a specific tab via defaultTab', () => {
    render(<Tabs tabs={SAMPLE_TABS} defaultTab="lessons">{renderContent}</Tabs>);
    expect(screen.getByRole('tab', { name: 'Lessons' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('panel-content')).toHaveTextContent('Panel: lessons');
  });

  it('switches to a different panel when a tab is clicked', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={SAMPLE_TABS}>{renderContent}</Tabs>);
    await user.click(screen.getByRole('tab', { name: 'Reviews' }));
    expect(screen.getByRole('tab', { name: 'Reviews' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('panel-content')).toHaveTextContent('Panel: reviews');
  });

  it('deselects the previously active tab when switching', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={SAMPLE_TABS}>{renderContent}</Tabs>);
    await user.click(screen.getByRole('tab', { name: 'Lessons' }));
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange with the new tab id when switching', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs tabs={SAMPLE_TABS} onChange={onChange}>{renderContent}</Tabs>);
    await user.click(screen.getByRole('tab', { name: 'Reviews' }));
    expect(onChange).toHaveBeenCalledWith('reviews');
  });

  it('renders a tablist with an aria-label', () => {
    render(<Tabs tabs={SAMPLE_TABS}>{renderContent}</Tabs>);
    expect(screen.getByRole('tablist', { name: 'Tabs' })).toBeInTheDocument();
  });

  it('renders a tabpanel controlled by the active tab', () => {
    render(<Tabs tabs={SAMPLE_TABS}>{renderContent}</Tabs>);
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-overview');
    expect(panel).toHaveAttribute('id', 'tabpanel-overview');
  });

  it('updates the tabpanel id/aria-labelledby when switching tabs', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={SAMPLE_TABS}>{renderContent}</Tabs>);
    await user.click(screen.getByRole('tab', { name: 'Lessons' }));
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('id', 'tabpanel-lessons');
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-lessons');
  });
});

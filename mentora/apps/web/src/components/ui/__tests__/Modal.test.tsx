import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../Modal';

// Helper — renders a controlled modal wrapper with a toggle button.
function ControlledModal({
  initialOpen = false,
  title,
  children = <p>Modal body</p>,
}: {
  initialOpen?: boolean;
  title?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open Modal</button>
      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        {children}
      </Modal>
    </>
  );
}

describe('Modal', () => {
  it('does not render its content when open=false', () => {
    render(<Modal open={false} onClose={vi.fn()} title="Hidden"><p>Secret</p></Modal>);
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('renders its content when open=true', () => {
    render(<Modal open onClose={vi.fn()} title="Visible"><p>Shown</p></Modal>);
    expect(screen.getByText('Shown')).toBeInTheDocument();
  });

  it('exposes role="dialog" and aria-modal="true"', () => {
    render(<Modal open onClose={vi.fn()} title="Test"><p>Content</p></Modal>);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('renders the title in a heading', () => {
    render(<Modal open onClose={vi.fn()} title="My Dialog"><p>Body</p></Modal>);
    expect(screen.getByRole('heading', { name: 'My Dialog' })).toBeInTheDocument();
  });

  it('renders the close button with an accessible name', () => {
    render(<Modal open onClose={vi.fn()} title="Close Me"><p>Content</p></Modal>);
    expect(screen.getByRole('button', { name: /close dialog/i })).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Closeable"><p>Content</p></Modal>);
    await user.click(screen.getByRole('button', { name: /close dialog/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the Escape key is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Esc Close"><p>Content</p></Modal>);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Backdrop"><p>Content</p></Modal>);
    // The dialog container is the outer fixed div; click outside the inner card
    const dialog = screen.getByRole('dialog');
    // The backdrop is the aria-hidden sibling div inside the dialog.
    // We find it by aria-hidden attribute.
    const backdrop = dialog.querySelector('[aria-hidden="true"]') as HTMLElement;
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('opens when the trigger is clicked and closes via the close button', async () => {
    const user = userEvent.setup();
    render(<ControlledModal title="Toggle" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open Modal' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close dialog/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the close button even without a title', () => {
    render(<Modal open onClose={vi.fn()}><p>No title</p></Modal>);
    expect(screen.getByRole('button', { name: /close dialog/i })).toBeInTheDocument();
  });

  it('does not set Escape listener when modal is closed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal open={false} onClose={onClose}><p>Closed</p></Modal>);
    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
  });
});

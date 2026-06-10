'use client';

import React, { useState } from 'react';
import clsx from 'clsx';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  children: (activeTab: string) => React.ReactNode;
  className?: string;
}

export function Tabs({ tabs, defaultTab, onChange, children, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? '');

  const handleChange = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div className={className}>
      {/* Tab strip: scrolls horizontally on mobile so no tab is ever clipped.
          -webkit-overflow-scrolling handled via the `overflow-x-auto` Tailwind
          utility which maps to `overflow: auto` — browsers apply momentum scroll
          automatically on iOS 13+. Hide the scrollbar visually but keep it
          accessible via scrollbar-width/scrollbar-color resets. */}
      <div
        role="tablist"
        className={[
          'flex gap-1 p-1 bg-surface-100 rounded-xl mb-6',
          /* horizontal scroll on small screens */
          'overflow-x-auto',
          /* hide scrollbar visually (WebKit + standard) while keeping scrollability */
          '[&::-webkit-scrollbar]:hidden [scrollbar-width:none]',
        ].join(' ')}
        aria-label="Tabs"
        /* iOS momentum scroll */
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => handleChange(tab.id)}
            className={clsx(
              /* On mobile each tab keeps its natural size and does NOT expand to
                 fill the strip — this prevents tabs from squishing below their
                 min-width and getting clipped.
                 On sm+ screens we restore flex-1 so tabs share the available width. */
              'shrink-0 sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
              'text-sm font-semibold transition-all duration-150 whitespace-nowrap min-h-[44px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              active === tab.id
                ? 'bg-white text-brand-600 shadow-soft'
                : 'text-stone-500 hover:text-stone-700 hover:bg-surface-200',
            )}
          >
            {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`tabpanel-${active}`}
        aria-labelledby={`tab-${active}`}
      >
        {children(active)}
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Overtime', isActive: (p: string) => p === '/' || p.startsWith('/employees/') },
  { href: '/clock-compliance', label: 'Clock Compliance', isActive: (p: string) => p.startsWith('/clock-compliance') },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="border-b"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center gap-1 px-4 sm:px-6 lg:px-8">
        {TABS.map((tab) => {
          const active = tab.isActive(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="border-b-2 px-3 py-3 text-sm font-medium transition-colors"
              style={{
                borderColor: active ? 'var(--seq-worked)' : 'transparent',
                color: active ? undefined : 'var(--text-secondary)',
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

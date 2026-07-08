'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Fragment } from 'react';

export function BreadcrumbBar() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="hidden md:flex items-center space-x-1 text-sm font-label text-on-surface-variant capitalize">
      <Link href="/" className="hover:text-primary transition-colors flex items-center">
        <span className="material-symbols-outlined text-[18px]">home</span>
      </Link>
      
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        
        return (
          <Fragment key={href}>
            <span className="material-symbols-outlined text-[16px] opacity-50">chevron_right</span>
            {isLast ? (
              <span className="font-semibold text-on-surface cursor-default">
                {segment.replace(/-/g, ' ')}
              </span>
            ) : (
              <Link href={href} className="hover:text-primary transition-colors">
                {segment.replace(/-/g, ' ')}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}

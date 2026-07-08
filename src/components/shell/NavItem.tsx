'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavItem as INavItem } from '../../types/rbac';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface NavItemProps {
  item: INavItem;
  collapsed?: boolean;
}

export function NavItem({ item, collapsed }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={twMerge(
        clsx(
          'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-150 active:scale-95 font-label text-label-md group relative',
          isActive
            ? 'bg-primary-container text-on-primary-container'
            : 'text-on-surface-variant hover:bg-surface-container-highest'
        )
      )}
      title={collapsed ? item.label : undefined}
    >
      <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
        {item.icon}
      </span>
      {!collapsed && (
        <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
          {item.label}
        </span>
      )}
      {!collapsed && item.badge && (
        <span className="ml-auto bg-error text-on-error text-xs font-bold px-2 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
      
      {/* Collapsed Badge Indicator */}
      {collapsed && item.badge && (
        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface-container-low" />
      )}
    </Link>
  );
}

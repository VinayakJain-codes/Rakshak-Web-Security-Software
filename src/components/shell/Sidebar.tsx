'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import { UserRole } from '../../types/rbac';
import { getNavItemsByRole } from '../../config/navigation';
import { NavItem } from './NavItem';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SidebarProps {
  role: UserRole;
  collapsed: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ role, collapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const router = useRouter();
  const supabase = createClient();
  const items = getNavItemsByRole(role);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };
  
  const title = 
    role === UserRole.SUPER_ADMIN ? 'Rakshak Admin' :
    role === UserRole.CLIENT_OWNER ? 'Rakshak Enterprise' :
    'Rakshak Ops';
    
  const subtitle = 
    role === UserRole.SUPER_ADMIN ? 'System Oversight' :
    role === UserRole.CLIENT_OWNER ? 'Client Dashboard' :
    'Tactical Command';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-surface-container-highest/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Sidebar Panel */}
      <aside 
        className={twMerge(
          clsx(
            'fixed left-0 top-0 h-full flex flex-col z-50 bg-surface-container-low border-r border-outline-variant shadow-sm transition-all duration-300 ease-in-out',
            collapsed ? 'w-20 hidden md:flex' : 'w-64',
            mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          )
        )}
      >
        <div className={clsx("p-6", collapsed && "px-2 flex justify-center")}>
          {!collapsed ? (
            <div>
              <h1 className="text-lg font-headline font-bold text-on-surface truncate">{title}</h1>
              <p className="text-xs text-on-surface-variant font-label opacity-70 truncate">{subtitle}</p>
            </div>
          ) : (
            <div className="w-10 h-10 bg-primary text-on-primary rounded-xl flex items-center justify-center font-bold font-headline">
              R
            </div>
          )}
        </div>
        
        <nav className="flex-1 mt-4 space-y-1 overflow-y-auto py-2 scrollbar-thin">
          {items.map((item) => (
            <NavItem key={item.href} item={item} collapsed={collapsed} />
          ))}
        </nav>
        
        <div className="mt-auto border-t border-outline-variant p-2 space-y-1">
          <div className={clsx(
            "flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-label text-label-md",
            collapsed && "justify-center px-0"
          )}>
            <span className="material-symbols-outlined">badge</span>
            {!collapsed && (
              <span className="flex-1 truncate uppercase text-xs font-bold tracking-wider opacity-70">
                {role.replace('_', ' ')}
              </span>
            )}
          </div>
          
          <button 
            onClick={handleLogout}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error-container hover:text-on-error-container transition-colors font-label text-label-md",
              collapsed && "justify-center px-0"
            )}
            title="Log out"
          >
            <span className="material-symbols-outlined">logout</span>
            {!collapsed && (
              <span className="flex-1 text-left truncate font-bold">Log out</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

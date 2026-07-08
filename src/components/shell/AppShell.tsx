'use client';

import { useState } from 'react';
import { UserRole } from '../../types/rbac';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AppShellProps {
  role: UserRole;
  children: React.ReactNode;
}

export function AppShell({ role, children }: AppShellProps) {
  // Mobile-first default: collapsed on desktop for Supervisor, expanded for others
  const [collapsed, setCollapsed] = useState(role === UserRole.SUPERVISOR);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-on-background flex">
      <Sidebar 
        role={role} 
        collapsed={collapsed} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />
      
      <div 
        className={twMerge(
          clsx(
            'flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out',
            collapsed ? 'md:ml-20' : 'md:ml-64'
          )
        )}
      >
        <TopBar 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
          setMobileOpen={setMobileOpen} 
        />
        
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

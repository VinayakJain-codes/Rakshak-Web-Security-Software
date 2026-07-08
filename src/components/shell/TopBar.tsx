'use client';

import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ThemeToggle } from './ThemeToggle';
import { BreadcrumbBar } from './BreadcrumbBar';
import { IndianTimeClock } from '../ui/rakshak/IndianTimeClock';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';

interface TopBarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  setMobileOpen: (open: boolean) => void;
}

export function TopBar({ collapsed, setCollapsed, setMobileOpen }: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
        setShowSettings(false);
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const toggleMenu = (menu: 'notifications' | 'settings' | 'profile') => {
    setShowNotifications(menu === 'notifications' ? !showNotifications : false);
    setShowSettings(menu === 'settings' ? !showSettings : false);
    setShowProfile(menu === 'profile' ? !showProfile : false);
  };

  return (
    <header className={twMerge(
      clsx(
        'sticky top-0 z-40 flex justify-between items-center px-4 md:px-6 py-3 bg-surface border-b border-outline-variant transition-all duration-300 ease-in-out',
      )
    )}>
      <div className="flex items-center gap-4 md:gap-6">
        {/* Mobile Hamburger */}
        <button 
          className="md:hidden p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
          onClick={() => setMobileOpen(true)}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Desktop Collapse Toggle */}
        <button 
          className="hidden md:flex p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
          onClick={() => setCollapsed(!collapsed)}
        >
          <span className="material-symbols-outlined">
            {collapsed ? 'menu_open' : 'menu'}
          </span>
        </button>

        <BreadcrumbBar />
      </div>

      <div className="flex items-center gap-2" ref={menuRef}>
        {/* Global Search (Hidden on Mobile) */}
        <div className="relative group hidden md:block mr-4">
          <span className="absolute inset-y-0 left-3 flex items-center text-outline pointer-events-none">
            <span className="material-symbols-outlined text-sm">search</span>
          </span>
          <input 
            className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-1.5 text-sm w-64 focus:ring-2 focus:ring-primary-container transition-all" 
            placeholder="Global system search..." 
            type="text" 
          />
        </div>

        <IndianTimeClock />
        <ThemeToggle />

        <div className="relative">
          <button 
            onClick={() => toggleMenu('notifications')}
            className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-surface-container-high text-primary' : 'hover:bg-surface-container-high text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="p-3 border-b border-outline-variant font-bold text-sm text-on-surface">
                Notifications
              </div>
              <div className="p-4 text-center text-sm font-label text-on-surface-variant">
                No new notifications.
              </div>
            </div>
          )}
        </div>

        <div className="relative hidden sm:block">
          <button 
            onClick={() => toggleMenu('settings')}
            className={`p-2 rounded-full transition-colors relative ${showSettings ? 'bg-surface-container-high text-primary' : 'hover:bg-surface-container-high text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
          
          {showSettings && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="p-2 space-y-1">
                <button onClick={() => { router.push('/admin/settings'); setShowSettings(false); }} className="w-full text-left px-3 py-2 text-sm font-label rounded hover:bg-surface-container-low transition-colors">Platform Settings</button>
                <button onClick={() => { router.push('/admin/preferences'); setShowSettings(false); }} className="w-full text-left px-3 py-2 text-sm font-label rounded hover:bg-surface-container-low transition-colors">Preferences</button>
              </div>
            </div>
          )}
        </div>

        <div className="relative ml-2">
          <div 
            onClick={() => toggleMenu('profile')}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer border transition-all ${
              showProfile 
                ? 'bg-primary text-on-primary border-primary shadow-sm' 
                : 'bg-primary-container text-on-primary-container border-outline-variant hover:opacity-80'
            }`}
          >
            RS
          </div>
          
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="p-3 border-b border-outline-variant flex flex-col">
                <span className="font-bold text-sm text-on-surface">Super Admin</span>
                <span className="text-xs font-mono text-on-surface-variant truncate">superadmin@rakshak.in</span>
              </div>
              <div className="p-2">
                <button onClick={handleLogout} className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm font-bold text-error rounded hover:bg-error/10 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

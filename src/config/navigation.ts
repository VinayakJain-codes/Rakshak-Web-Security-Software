import { NavItem, UserRole } from '../types/rbac';

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: 'Real-Time MRR/ARR Dashboard',
    labelHi: 'रीयल-टाइम MRR/ARR डैशबोर्ड',
    href: '/admin/dashboard',
    icon: 'monitoring',
  },
  {
    label: 'Tenant Registration',
    labelHi: 'किरायेदार पंजीकरण',
    href: '/admin/tenants',
    icon: 'domain_add',
  },
  {
    label: 'Global Support Queues',
    labelHi: 'वैश्विक समर्थन कतार',
    href: '/admin/support',
    icon: 'support_agent',
  },
  {
    label: 'System-Wide Audit Logs',
    labelHi: 'सिस्टम-व्यापी ऑडिट लॉग',
    href: '/admin/audit',
    icon: 'receipt_long',
  },
];

export const CLIENT_NAV_ITEMS: NavItem[] = [
  {
    label: 'Organization Dashboard',
    labelHi: 'संगठन डैशबोर्ड',
    href: '/org/dashboard',
    icon: 'dashboard',
  },
  {
    label: 'Billing & Invoicing',
    labelHi: 'बिलिंग और चालान',
    href: '/org/billing',
    icon: 'payments',
  },
  {
    label: 'Compliance Tracking',
    labelHi: 'अनुपालन ट्रैकिंग',
    href: '/org/compliance',
    icon: 'verified_user',
  },
  {
    label: 'Compliance Report Exporter',
    labelHi: 'अनुपालन रिपोर्ट निर्यातक',
    href: '/org/reports',
    icon: 'download',
  },
];

export const OPS_NAV_ITEMS: NavItem[] = [
  {
    label: 'Daily Operational Dashboard',
    labelHi: 'दैनिक परिचालन डैशबोर्ड',
    href: '/ops/dashboard',
    icon: 'speed',
  },
  {
    label: 'Live Guard Tracker',
    labelHi: 'लाइव गार्ड ट्रैकर',
    href: '/ops/tracker',
    icon: 'radar',
  },
  {
    label: 'Pending Alert Stream',
    labelHi: 'लंबित अलर्ट स्ट्रीम',
    href: '/ops/alerts',
    icon: 'notifications_active',
  },
  {
    label: 'Incident Management',
    labelHi: 'घटना प्रबंधन',
    href: '/ops/incidents',
    icon: 'report',
  },
];

export const getNavItemsByRole = (role: UserRole): NavItem[] => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return ADMIN_NAV_ITEMS;
    case UserRole.CLIENT_OWNER:
      return CLIENT_NAV_ITEMS;
    case UserRole.SUPERVISOR:
      return OPS_NAV_ITEMS;
    default:
      return [];
  }
};

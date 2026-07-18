export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CLIENT_OWNER = 'CLIENT_OWNER',
  SUPERVISOR = 'SUPERVISOR',
  GUARD = 'GUARD',
}

export type Permission = string;

export interface NavItem {
  label: string;
  labelHi: string;
  href: string;
  icon: string;
  badge?: string;
  children?: NavItem[];
}

export interface RouteConfig {
  path: string;
  roles: UserRole[];
  exact?: boolean;
}

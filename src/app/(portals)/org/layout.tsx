import { UserRole } from '../../../types/rbac';
import { AppShell } from '../../../components/shell/AppShell';

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role={UserRole.CLIENT_OWNER}>
      {children}
    </AppShell>
  );
}

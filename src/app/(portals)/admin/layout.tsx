import { UserRole } from '../../../types/rbac';
import { AppShell } from '../../../components/shell/AppShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role={UserRole.SUPER_ADMIN}>
      {children}
    </AppShell>
  );
}

import { UserRole } from '../../../types/rbac';
import { AppShell } from '../../../components/shell/AppShell';

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role={UserRole.SUPERVISOR}>
      {children}
    </AppShell>
  );
}

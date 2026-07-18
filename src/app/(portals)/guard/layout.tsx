import { UserRole } from '../../../types/rbac';
import { AppShell } from '../../../components/shell/AppShell';

export default function GuardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role={UserRole.GUARD}>
      {children}
    </AppShell>
  );
}

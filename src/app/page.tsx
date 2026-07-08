import Link from 'next/link';

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-headline font-black text-primary uppercase tracking-tighter">
            Rakshak Security
          </h1>
          <p className="mt-2 text-on-surface-variant font-label text-lg">
            Development Preview — Phase 2 Shell
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/dashboard" className="block group">
            <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant hover:border-primary transition-colors hover:shadow-md h-full flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
              </div>
              <h2 className="text-xl font-bold text-on-surface mb-2">Super Admin</h2>
              <p className="text-sm text-on-surface-variant font-label">
                Agency Command Center for platform-wide telemetry and global configuration.
              </p>
            </div>
          </Link>

          <Link href="/org/dashboard" className="block group">
            <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant hover:border-secondary transition-colors hover:shadow-md h-full flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">corporate_fare</span>
              </div>
              <h2 className="text-xl font-bold text-on-surface mb-2">Client Owner</h2>
              <p className="text-sm text-on-surface-variant font-label">
                Enterprise dashboard for managing locations, compliance, and schedules.
              </p>
            </div>
          </Link>

          <Link href="/ops/dashboard" className="block group">
            <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant hover:border-error transition-colors hover:shadow-md h-full flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">local_police</span>
              </div>
              <h2 className="text-xl font-bold text-on-surface mb-2">Supervisor</h2>
              <p className="text-sm text-on-surface-variant font-label">
                Tactical, mobile-first operations center for live guard tracking and incidents.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = '***REMOVED***';
const supabaseAnonKey = '***REMOVED***';

// We will use the SUPER_ADMIN to insert all data so RLS policies don't block us, 
// or since we are running as a direct script, we can login as the Super Admin first.
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

async function run() {
  console.log('Logging in as Super Admin to seed data...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'admin@rakshak.in',
    password: '***REMOVED***',
  });

  if (loginError) {
    console.error('Super Admin login failed:', loginError.message);
    return;
  }

  console.log('Super Admin logged in. Initializing authenticated client...');
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${loginData.session.access_token}`
      }
    }
  });

  // Define UUIDs
  const tenants = {
    nexus: 'c032649b-73e4-4d1a-be03-5197825d19a4',
    cityGuard: '75c3258c-8822-488d-a19c-09758778f244',
    globalLogistics: 'e12ab73b-cc45-4299-bbd9-952864efab55',
    internal: 'fa3b6c22-001c-43f9-ba2a-e1cf8ab6b999'
  };

  // 1. Seed Tenants
  console.log('Seeding Tenants...');
  const tenantRows = [
    {
      id: tenants.nexus,
      name: 'Nexus Security',
      owner_email: 'client1@rakshak.in',
      billing_tier: 'Professional',
      guard_capacity: 100,
      site_capacity: 10,
      status: 'warning'
    },
    {
      id: tenants.cityGuard,
      name: 'City Guard Co',
      owner_email: 'billing@cityguard.co',
      billing_tier: 'Starter',
      guard_capacity: 25,
      site_capacity: 2,
      status: 'active'
    },
    {
      id: tenants.globalLogistics,
      name: 'Global Logistics Inc',
      owner_email: 'admin@global.log',
      billing_tier: 'Enterprise',
      guard_capacity: 1000,
      site_capacity: 50,
      status: 'active'
    },
    {
      id: tenants.internal,
      name: 'Rakshak Internal',
      owner_email: 'admin@rakshak.in',
      billing_tier: 'Enterprise',
      guard_capacity: 9999,
      site_capacity: 999,
      status: 'active'
    }
  ];

  for (const tenant of tenantRows) {
    const { error } = await client.from('tenants').upsert(tenant);
    if (error) console.error(`Error upserting tenant ${tenant.name}:`, error.message);
  }

  // 2. Seed Geofences (Sites)
  console.log('Seeding Geofences (Sites)...');
  const geofenceRows = [
    {
      id: 'd8c3645b-73e4-4d1a-be03-5197825d1001',
      tenant_id: tenants.nexus,
      site_name: 'Tech Park Campus',
      color: '#007AFF',
      polygon: [
        { lat: 23.0210, lng: 72.5700 },
        { lat: 23.0240, lng: 72.5700 },
        { lat: 23.0240, lng: 72.5730 },
        { lat: 23.0210, lng: 72.5730 }
      ]
    },
    {
      id: 'd8c3645b-73e4-4d1a-be03-5197825d1002',
      tenant_id: tenants.cityGuard,
      site_name: 'Logistics Hub',
      color: '#34C759',
      polygon: [
        { lat: 23.0280, lng: 72.5780 },
        { lat: 23.0320, lng: 72.5780 },
        { lat: 23.0320, lng: 72.5820 },
        { lat: 23.0280, lng: 72.5820 }
      ]
    },
    {
      id: 'd8c3645b-73e4-4d1a-be03-5197825d1003',
      tenant_id: tenants.globalLogistics,
      site_name: 'Residency Complex',
      color: '#FF9500',
      polygon: [
        { lat: 23.0130, lng: 72.5580 },
        { lat: 23.0170, lng: 72.5580 },
        { lat: 23.0170, lng: 72.5620 },
        { lat: 23.0130, lng: 72.5620 }
      ]
    }
  ];

  for (const geofence of geofenceRows) {
    const { error } = await client.from('geofences').upsert(geofence);
    if (error) console.error(`Error upserting geofence ${geofence.site_name}:`, error.message);
  }

  // 3. Seed Guards
  console.log('Seeding Guards...');
  const now = new Date();
  const shiftStart = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString();
  const shiftEnd = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();

  const guardRows = [
    {
      id: 'd8c3645b-73e4-4d1a-be03-5197825d2001',
      tenant_id: tenants.nexus,
      name: 'Ramesh Kumar',
      status: 'active',
      site_id: 'd8c3645b-73e4-4d1a-be03-5197825d1001',
      shift_start: shiftStart,
      shift_end: shiftEnd,
      position: { lat: 23.0225, lng: 72.5714 },
      telemetry: {
        biometricVector: 'Verified — 99.2% match',
        gpsCoordinates: { lat: 23.0225, lng: 72.5714 },
        networkEpochTime: Date.now(),
        accelerometerVector: [0.1, 9.8, 0.2],
        ambientBrightness: 85,
        rootDetectionStatus: 'clean',
        batteryLevel: 78,
        signalStrength: -65,
        lastSyncedAt: Date.now() - 5000,
      }
    },
    {
      id: 'd8c3645b-73e4-4d1a-be03-5197825d2002',
      tenant_id: tenants.nexus,
      name: 'Suresh Patel',
      status: 'active',
      site_id: 'd8c3645b-73e4-4d1a-be03-5197825d1001',
      shift_start: shiftStart,
      shift_end: shiftEnd,
      position: { lat: 23.0230, lng: 72.5720 },
      telemetry: {
        biometricVector: 'Verified — 98.5% match',
        gpsCoordinates: { lat: 23.0230, lng: 72.5720 },
        networkEpochTime: Date.now(),
        accelerometerVector: [0.2, 9.7, 0.1],
        ambientBrightness: 90,
        rootDetectionStatus: 'clean',
        batteryLevel: 62,
        signalStrength: -70,
        lastSyncedAt: Date.now() - 12000,
      }
    },
    {
      id: 'd8c3645b-73e4-4d1a-be03-5197825d2003',
      tenant_id: tenants.nexus,
      name: 'Mahesh Singh',
      status: 'pending',
      site_id: 'd8c3645b-73e4-4d1a-be03-5197825d1001',
      shift_start: shiftStart,
      shift_end: shiftEnd,
      position: { lat: 23.0210, lng: 72.5700 },
      telemetry: {
        biometricVector: 'Verification Pending',
        gpsCoordinates: { lat: 23.0210, lng: 72.5700 },
        networkEpochTime: Date.now(),
        accelerometerVector: [0, 0, 0],
        ambientBrightness: 40,
        rootDetectionStatus: 'clean',
        batteryLevel: 45,
        signalStrength: -85,
        lastSyncedAt: Date.now() - 30000,
      }
    },
    {
      id: 'd8c3645b-73e4-4d1a-be03-5197825d2004',
      tenant_id: tenants.nexus,
      name: 'Vikram Joshi',
      status: 'critical',
      site_id: 'd8c3645b-73e4-4d1a-be03-5197825d1001',
      shift_start: shiftStart,
      shift_end: shiftEnd,
      position: { lat: 23.0250, lng: 72.5750 },
      telemetry: {
        biometricVector: 'Failed — 45% match',
        gpsCoordinates: { lat: 23.0250, lng: 72.5750 },
        networkEpochTime: Date.now(),
        accelerometerVector: [1.2, 8.5, -2.1],
        ambientBrightness: 10,
        rootDetectionStatus: 'clean',
        batteryLevel: 15,
        signalStrength: -95,
        lastSyncedAt: Date.now() - 120000,
      }
    },
    {
      id: 'd8c3645b-73e4-4d1a-be03-5197825d2005',
      tenant_id: tenants.cityGuard,
      name: 'Amit Shah',
      status: 'active',
      site_id: 'd8c3645b-73e4-4d1a-be03-5197825d1002',
      shift_start: shiftStart,
      shift_end: shiftEnd,
      position: { lat: 23.0300, lng: 72.5800 },
      telemetry: {
        biometricVector: 'Verified — 97.8% match',
        gpsCoordinates: { lat: 23.0300, lng: 72.5800 },
        networkEpochTime: Date.now(),
        accelerometerVector: [0.05, 9.81, 0.05],
        ambientBrightness: 100,
        rootDetectionStatus: 'clean',
        batteryLevel: 92,
        signalStrength: -55,
        lastSyncedAt: Date.now() - 2000,
      }
    },
    {
      id: 'd8c3645b-73e4-4d1a-be03-5197825d2006',
      tenant_id: tenants.cityGuard,
      name: 'Rahul Desai',
      status: 'active',
      site_id: 'd8c3645b-73e4-4d1a-be03-5197825d1002',
      shift_start: shiftStart,
      shift_end: shiftEnd,
      position: { lat: 23.0310, lng: 72.5810 },
      telemetry: {
        biometricVector: 'Verified — 99.9% match',
        gpsCoordinates: { lat: 23.0310, lng: 72.5810 },
        networkEpochTime: Date.now(),
        accelerometerVector: [0, 9.8, 0],
        ambientBrightness: 88,
        rootDetectionStatus: 'clean',
        batteryLevel: 85,
        signalStrength: -60,
        lastSyncedAt: Date.now() - 8000,
      }
    },
    {
      id: 'd8c3645b-73e4-4d1a-be03-5197825d2007',
      tenant_id: tenants.cityGuard,
      name: 'Dinesh Waghela',
      status: 'critical',
      site_id: 'd8c3645b-73e4-4d1a-be03-5197825d1002',
      shift_start: shiftStart,
      shift_end: shiftEnd,
      position: { lat: 23.0290, lng: 72.5790 },
      telemetry: {
        biometricVector: 'Last Known: Verified',
        gpsCoordinates: { lat: 23.0290, lng: 72.5790 },
        networkEpochTime: Date.now() - 600000,
        accelerometerVector: [0, 0, 0],
        ambientBrightness: 0,
        rootDetectionStatus: 'unknown',
        batteryLevel: 2,
        signalStrength: -120,
        lastSyncedAt: Date.now() - 600000,
      }
    },
    {
      id: 'd8c3645b-73e4-4d1a-be03-5197825d2008',
      tenant_id: tenants.globalLogistics,
      name: 'Kamlesh Tiwari',
      status: 'completed',
      site_id: 'd8c3645b-73e4-4d1a-be03-5197825d1003',
      shift_start: new Date(now.getTime() - 9 * 60 * 60 * 1000).toISOString(),
      shift_end: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      position: { lat: 23.0150, lng: 72.5600 },
      telemetry: {
        biometricVector: 'Shift Completed',
        gpsCoordinates: { lat: 23.0150, lng: 72.5600 },
        networkEpochTime: Date.now() - 1 * 60 * 60 * 1000,
        accelerometerVector: [0, 9.8, 0],
        ambientBrightness: 50,
        rootDetectionStatus: 'clean',
        batteryLevel: 30,
        signalStrength: -75,
        lastSyncedAt: Date.now() - 1 * 60 * 60 * 1000,
      }
    }
  ];

  for (const guard of guardRows) {
    const { error } = await client.from('guards').upsert(guard);
    if (error) console.error(`Error upserting guard ${guard.name}:`, error.message);
  }

  // 4. Seed Support Tickets
  console.log('Seeding Support Tickets...');
  const supportRows = [
    {
      tenant_id: tenants.nexus,
      title: 'Tenant Over-capacity Warning',
      description: '"Nexus Security" has exceeded their Professional Tier guard limit (104/100). Automated overage billing initiated.',
      status: 'OPEN',
      severity: 'critical'
    },
    {
      tenant_id: tenants.globalLogistics,
      title: 'API Integration Request',
      description: '"Global Logistics Inc" is requesting custom SAML SSO setup. Pending technical review.',
      status: 'OPEN',
      severity: 'info'
    },
    {
      tenant_id: tenants.cityGuard,
      title: 'Billing Method Failure',
      description: 'Razorpay auto-debit failed for "City Guard Co". Notification sent to billing admin.',
      status: 'OPEN',
      severity: 'warning'
    }
  ];

  const { error: supportError } = await client.from('support_tickets').upsert(supportRows);
  if (supportError) console.error('Error seeding support tickets:', supportError.message);

  // 5. Seed Audit Logs
  console.log('Seeding Audit Logs...');
  const auditRows = [
    {
      tenant_id: tenants.nexus,
      actor: 'rajesh.admin@nexus.co',
      action: 'Overage Triggered',
      target_resource: 'Guard Capacity (104/100)',
      ip_address: '103.119.24.11',
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      tenant_id: tenants.globalLogistics,
      actor: 'system_webhook',
      action: 'Billing Failed',
      target_resource: 'Razorpay Inv_98231',
      ip_address: 'api.razorpay.com',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      tenant_id: tenants.cityGuard,
      actor: 'super.admin@rakshak.io',
      action: 'Provisioned Tenant',
      target_resource: 'City Guard Co (ID: 882)',
      ip_address: '192.168.1.45',
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      tenant_id: tenants.nexus,
      actor: 'amit.supervisor@nexus.co',
      action: 'Updated Geofence',
      target_resource: 'Tech Park Campus (Site: 1)',
      ip_address: '103.119.24.11',
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      tenant_id: tenants.globalLogistics,
      actor: 'priya.admin@global.log',
      action: 'Login Success',
      target_resource: 'Auth Session',
      ip_address: '112.196.44.20',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
    }
  ];

  const { error: auditError } = await client.from('audit_logs').upsert(auditRows);
  if (auditError) console.error('Error seeding audit logs:', auditError.message);

  // 6. Seed Alerts
  console.log('Seeding Alerts...');
  const alertRows = [
    {
      tenant_id: tenants.nexus,
      type: 'Geofence Breach Detected',
      severity: 'CRITICAL',
      guard_name: 'Vikram Joshi',
      location: 'Tech Park Campus',
      acknowledged: false,
      timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString()
    },
    {
      tenant_id: tenants.cityGuard,
      type: 'Biometric Verification Failed',
      severity: 'HIGH',
      guard_name: 'Dinesh Waghela',
      location: 'Logistics Hub',
      acknowledged: false,
      timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString()
    },
    {
      tenant_id: tenants.nexus,
      type: 'Missed Patrol Checkpoint',
      severity: 'WARNING',
      guard_name: 'Mahesh Singh',
      location: 'Tech Park Campus',
      acknowledged: true,
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      tenant_id: tenants.globalLogistics,
      type: 'Device Offline',
      severity: 'WARNING',
      guard_name: 'Kamlesh Tiwari',
      location: 'Residency Complex',
      acknowledged: true,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
    }
  ];

  const { error: alertError } = await client.from('alerts').upsert(alertRows);
  if (alertError) console.error('Error seeding alerts:', alertError.message);

  // 7. Seed Incidents
  console.log('Seeding Incidents...');
  const incidentRows = [
    {
      tenant_id: tenants.nexus,
      title: 'Suspicious Vehicle near gate 2',
      status: 'OPEN',
      priority: 'HIGH',
      assignee: 'Unassigned',
      created_at: new Date(now.getTime() - 10 * 60 * 1000).toISOString()
    },
    {
      tenant_id: tenants.cityGuard,
      title: 'Power failure in warehouse B',
      status: 'INVESTIGATING',
      priority: 'MEDIUM',
      assignee: 'Rajesh Patel',
      created_at: new Date(now.getTime() - 40 * 60 * 1000).toISOString()
    },
    {
      tenant_id: tenants.globalLogistics,
      title: 'Gate sensor malfunction',
      status: 'RESOLVED',
      priority: 'LOW',
      assignee: 'Priya Sharma',
      created_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString()
    }
  ];

  const { error: incidentError } = await client.from('incidents').upsert(incidentRows);
  if (incidentError) console.error('Error seeding incidents:', incidentError.message);

  // 8. Seed System Metrics
  console.log('Seeding System Metrics...');
  const metricRows = [
    { key: 'mrr', value: '$142,500' },
    { key: 'active_tenants', value: '48' },
    { key: 'total_guards', value: '4,250' },
    { key: 'compliance_rate', value: '98.4%' }
  ];

  for (const metric of metricRows) {
    const { error } = await client.from('system_metrics').upsert(metric);
    if (error) console.error(`Error upserting metric ${metric.key}:`, error.message);
  }

  console.log('All seeding operations completed successfully!');
}

run().catch(console.error);

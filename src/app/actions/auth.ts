'use server'

import { createClient } from '@supabase/supabase-js';
import { UserRole } from '../../types/rbac';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generatePassword() {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0, n = 12; i < n; ++i) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export async function createGuardAccount(data: { name: string, email: string, tenantId: string, siteId?: string }) {
  const password = generatePassword();
  
  // 1. Check capacity
  const { data: tenant, error: tenantErr } = await supabaseAdmin.from('tenants').select('guard_capacity').eq('id', data.tenantId).single();
  if (tenantErr || !tenant) return { error: 'Tenant not found' };

  const { count, error: countErr } = await supabaseAdmin.from('guards').select('*', { count: 'exact', head: true }).eq('tenant_id', data.tenantId);
  if (countErr) return { error: 'Failed to check capacity' };

  if (count !== null && count >= tenant.guard_capacity) {
    return { error: 'Guard capacity exceeded for this tenant' };
  }

  // 2. Create auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: password,
    email_confirm: true,
    user_metadata: { name: data.name } // Only non-secure metadata here
  });

  if (authError) {
    return { error: authError.message };
  }

  // 3. Insert secure profile
  const { error: profileError } = await supabaseAdmin.from('profiles').insert([{
    id: authData.user.id,
    role: UserRole.GUARD,
    tenant_id: data.tenantId
  }]);

  if (profileError) {
    // Rollback could go here if needed
    return { error: profileError.message };
  }

  // 2. Insert into guards table
  const { error: guardError } = await supabaseAdmin.from('guards').insert([{
    id: authData.user.id,
    tenant_id: data.tenantId,
    name: data.name,
    status: 'pending',
    site_id: data.siteId || null,
  }]);

  if (guardError) {
    return { error: guardError.message };
  }

  return { password, email: data.email, id: authData.user.id };
}

export async function createClientOwnerAccount(data: { orgName: string, ownerEmail: string, billingTier: string, guardCapacity: number, siteCapacity: number, customPricing: number | null, features: any }) {
  const password = generatePassword();
  
  // 1. Create auth user (client owner)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.ownerEmail,
    password: password,
    email_confirm: true,
    user_metadata: {
      name: data.orgName + ' Admin'
    }
  });

  if (authError) {
    return { error: authError.message };
  }
  
  const { data: tenantData, error: tenantError } = await supabaseAdmin.from('tenants').insert([{
    name: data.orgName,
    owner_email: data.ownerEmail,
    billing_tier: data.billingTier,
    guard_capacity: data.guardCapacity,
    site_capacity: data.siteCapacity,
    custom_pricing: data.customPricing,
    features: data.features,
    status: 'active'
  }]).select().single();

  if (tenantError) {
    return { error: tenantError.message };
  }

  const tenantId = tenantData.id;

  // Create secure profile
  const { error: profileError } = await supabaseAdmin.from('profiles').insert([{
    id: authData.user.id,
    role: UserRole.CLIENT_OWNER,
    tenant_id: tenantId
  }]);

  if (profileError) {
    return { error: profileError.message };
  }

  return { password, email: data.ownerEmail, tenantId };
}

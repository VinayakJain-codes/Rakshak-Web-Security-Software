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
  
  // 1. Create auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: password,
    email_confirm: true,
    user_metadata: {
      role: UserRole.GUARD,
      tenant_id: data.tenantId,
      name: data.name
    }
  });

  if (authError) {
    return { error: authError.message };
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
      role: UserRole.CLIENT_OWNER,
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

  // Update user with tenant_id
  await supabaseAdmin.auth.admin.updateUserById(authData.user.id, {
    user_metadata: {
      role: UserRole.CLIENT_OWNER,
      tenant_id: tenantId,
      name: data.orgName + ' Admin'
    }
  });

  return { password, email: data.ownerEmail, tenantId };
}

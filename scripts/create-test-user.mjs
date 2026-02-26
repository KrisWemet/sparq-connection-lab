/**
 * One-time setup script: creates an email-confirmed test user in Supabase
 * using the service role key (bypasses email confirmation).
 *
 * Usage:
 *   npm run setup:test-user
 *
 * Required in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...    (from Supabase → Project Settings → API → service_role key)
 *   TEST_USER_EMAIL=e2e-test@sparq.app
 *   TEST_USER_PASSWORD=E2eTestPass123!
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Manually parse .env.local (dotenv may not be installed)
function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local may not exist — rely on environment variables being set already
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = process.env.TEST_USER_EMAIL ?? 'e2e-test@sparq.app';
const PASSWORD = process.env.TEST_USER_PASSWORD ?? 'E2eTestPass123!';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.error('   Get the service_role key from: Supabase → Project Settings → API');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log(`Checking for test user: ${EMAIL}`);

const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
if (listError) {
  console.error('❌  Failed to list users:', listError.message);
  process.exit(1);
}

const existing = users.find(u => u.email === EMAIL);
if (existing) {
  console.log(`✅  Test user already exists (id: ${existing.id})`);
  console.log(`   Email: ${EMAIL}`);
  process.exit(0);
}

console.log('Creating test user...');
const { data, error } = await supabase.auth.admin.createUser({
  email: EMAIL,
  password: PASSWORD,
  email_confirm: true,   // Skip email confirmation
});

if (error) {
  console.error('❌  Failed to create test user:', error.message);
  process.exit(1);
}

console.log(`✅  Created test user (id: ${data.user.id})`);
console.log(`   Email:    ${EMAIL}`);
console.log(`   Password: ${PASSWORD}`);
console.log('');
console.log('Add these to .env.local if not already there:');
console.log(`  TEST_USER_EMAIL=${EMAIL}`);
console.log(`  TEST_USER_PASSWORD=${PASSWORD}`);

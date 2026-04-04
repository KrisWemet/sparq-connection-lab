#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(path.join(root, filePath), 'utf8');
  } catch {
    return null;
  }
}

function exists(filePath) {
  return fs.existsSync(path.join(root, filePath));
}

function report(status, message) {
  console.log(`${status} ${message}`);
}

let hasFailure = false;

const envExample = readFileSafe('.env.example') || '';
const envLocal = readFileSafe('.env.local') || '';
const schema = readFileSafe('supabase/schema.sql') || '';
const migrationDir = path.join(root, 'supabase/migrations');
const migrationBundle = exists('supabase/migrations')
  ? fs.readdirSync(migrationDir).sort().map((file) => readFileSafe(`supabase/migrations/${file}`) || '').join('\n')
  : '';

const requiredExampleKeys = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'OPENROUTER_API_KEY',
  'NEXT_PUBLIC_GOOGLE_API_KEY',
];

const optionalLocalKeys = [
  'TEST_USER_EMAIL',
  'TEST_USER_PASSWORD',
];

const requiredTables = [
  'daily_sessions',
  'user_preferences',
  'analytics_events',
  'outcome_assessments',
  'conflict_episodes',
];

const requiredRoutes = [
  'src/pages/login.tsx',
  'src/pages/onboarding.tsx',
  'src/pages/dashboard.tsx',
  'src/pages/daily-growth.tsx',
];

report('INFO', 'Checking beta env contract...');
for (const key of requiredExampleKeys) {
  if (envExample.includes(`${key}=`)) {
    report('PASS', `.env.example documents ${key}`);
  } else {
    report('FAIL', `.env.example is missing ${key}`);
    hasFailure = true;
  }
}

if (envLocal) {
  for (const key of requiredExampleKeys) {
    if (envLocal.includes(`${key}=`)) {
      report('PASS', `.env.local includes ${key}`);
    } else {
      report('WARN', `.env.local is missing ${key}`);
    }
  }
  for (const key of optionalLocalKeys) {
    if (envLocal.includes(`${key}=`)) {
      report('PASS', `.env.local includes ${key}`);
    } else {
      report('WARN', `.env.local is missing optional beta key ${key}`);
    }
  }
} else {
  report('WARN', '.env.local not found. Live env readiness still needs operator setup.');
}

report('INFO', 'Checking supported beta routes...');
for (const route of requiredRoutes) {
  if (exists(route)) {
    report('PASS', `${route} exists`);
  } else {
    report('FAIL', `${route} is missing`);
    hasFailure = true;
  }
}

report('INFO', 'Checking launch-blocker schema references...');
for (const table of requiredTables) {
  const found = schema.includes(table) || migrationBundle.includes(table);
  if (found) {
    report('PASS', `Found schema or migration reference for ${table}`);
  } else {
    report('FAIL', `Missing schema reference for ${table}`);
    hasFailure = true;
  }
}

const legacyRouteChecks = [
  ['src/pages/auth.tsx', "destination: '/login'"],
  ['src/pages/daily-questions.tsx', "destination: '/daily-growth'"],
  ['src/pages/daily-activity.tsx', "destination: '/daily-growth'"],
];

report('INFO', 'Checking legacy route quarantine...');
for (const [file, expected] of legacyRouteChecks) {
  const contents = readFileSafe(file) || '';
  if (contents.includes(expected)) {
    report('PASS', `${file} redirects to the supported beta path`);
  } else {
    report('FAIL', `${file} does not redirect to the supported beta path`);
    hasFailure = true;
  }
}

if (hasFailure) {
  report('FAIL', 'Beta readiness check found repo issues that should be fixed before inviting testers.');
  process.exit(1);
}

report('PASS', 'Repo-level beta readiness checks passed. Live Supabase and deployment verification can proceed.');

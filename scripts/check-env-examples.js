import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();

function loadFile(relativePath) {
  const filePath = path.join(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${relativePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function assertKeys(fileLabel, content, requiredKeys) {
  const missing = requiredKeys.filter((key) => {
    const pattern = new RegExp(`^\\s*${key}=`, 'm');
    return !pattern.test(content);
  });
  if (missing.length > 0) {
    throw new Error(`${fileLabel} is missing keys: ${missing.join(', ')}`);
  }
}

function main() {
  const backendEnvExample = loadFile('backend/.env.example');
  const frontendEnvExample = loadFile('frontend/.env.example');

  assertKeys('backend/.env.example', backendEnvExample, [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ANON_KEY',
    'TURNSTILE_SECRET_KEY',
    'ADMIN_TOKEN_SECRET'
  ]);
  assertKeys('frontend/.env.example', frontendEnvExample, [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_TURNSTILE_SITE_KEY'
  ]);

  console.log('Environment example files look good.');
}

try {
  main();
} catch (error) {
  console.error(error.message || String(error));
  process.exit(1);
}

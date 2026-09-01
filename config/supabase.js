const { createClient } = require('@supabase/supabase-js');

const requiredEnvironment = [
  'SHOP_SUPABASE_URL',
  'SHOP_SUPABASE_SERVICE_ROLE_KEY',
  'EMP_SUPABASE_URL',
  'EMP_SUPABASE_SERVICE_ROLE_KEY',
  'WEBHOOK_SECRET'
];

function getEnvironmentValue(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createSupabaseClients() {
  for (const name of requiredEnvironment) {
    getEnvironmentValue(name);
  }

  const shopClient = createClient(
    getEnvironmentValue('SHOP_SUPABASE_URL'),
    getEnvironmentValue('SHOP_SUPABASE_SERVICE_ROLE_KEY')
  );
  const employeeClient = createClient(
    getEnvironmentValue('EMP_SUPABASE_URL'),
    getEnvironmentValue('EMP_SUPABASE_SERVICE_ROLE_KEY')
  );

  return { shopClient, employeeClient };
}

const { shopClient, employeeClient } = createSupabaseClients();

module.exports = { shopClient, employeeClient };

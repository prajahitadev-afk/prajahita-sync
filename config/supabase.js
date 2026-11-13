const { createClient } = require('@supabase/supabase-js');

let employeeClient;

function required(name) {
  const value = process.env[name];
  if (!value || !value.trim()) throw new Error(`Missing required environment variable: ${name}`);
  return value.trim();
}

// Webhook payloads contain the source record; only destination credentials are needed.
function getEmployeeClient() {
  if (!employeeClient) {
    employeeClient = createClient(required('EMP_SUPABASE_URL'), required('EMP_SUPABASE_SERVICE_ROLE_KEY'), {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
  return employeeClient;
}

module.exports = { getEmployeeClient };

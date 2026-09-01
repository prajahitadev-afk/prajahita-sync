const { employeeClient } = require('../config/supabase');

async function upsertCustomer(record) {
  const { error } = await employeeClient.from('customers').upsert(record);
  if (error) {
    throw error;
  }
}

async function deleteCustomer(record) {
  const { error } = await employeeClient.from('customers').delete().eq('id', record.id);
  if (error) {
    throw error;
  }
}

module.exports = { upsertCustomer, deleteCustomer };

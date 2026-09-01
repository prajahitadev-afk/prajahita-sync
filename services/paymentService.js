const { employeeClient } = require('../config/supabase');

async function upsertPayment(record) {
  const { error } = await employeeClient.from('payments').upsert(record);
  if (error) {
    throw error;
  }
}

async function deletePayment(record) {
  const { error } = await employeeClient.from('payments').delete().eq('id', record.id);
  if (error) {
    throw error;
  }
}

module.exports = { upsertPayment, deletePayment };

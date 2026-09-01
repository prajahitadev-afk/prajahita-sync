const { employeeClient } = require('../config/supabase');

async function upsertOrder(record) {
  const { error } = await employeeClient.from('orders').upsert(record);
  if (error) {
    throw error;
  }
}

async function deleteOrder(record) {
  const { error } = await employeeClient.from('orders').delete().eq('id', record.id);
  if (error) {
    throw error;
  }
}

module.exports = { upsertOrder, deleteOrder };

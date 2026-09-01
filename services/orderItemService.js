const { employeeClient } = require('../config/supabase');

async function upsertOrderItem(record) {
  const { error } = await employeeClient.from('order_items').upsert(record);
  if (error) {
    throw error;
  }
}

async function deleteOrderItem(record) {
  const { error } = await employeeClient.from('order_items').delete().eq('id', record.id);
  if (error) {
    throw error;
  }
}

module.exports = { upsertOrderItem, deleteOrderItem };

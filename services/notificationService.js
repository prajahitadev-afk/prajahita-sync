const crypto = require('node:crypto');
const { getEmployeeClient } = require('../config/supabase');

function notificationIdForOrder(orderId) {
  const bytes = crypto.createHash('sha256').update(`prajahita-sync:shop:order:${String(orderId)}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-');
}

async function createOrderNotification(order) {
  if (!order || order.id === undefined || order.id === null) throw new TypeError('Cannot notify without order.id');
  const notification = {
    id: notificationIdForOrder(order.id), user_id: null,
    title: 'New Shop Order', message: `Order #${order.order_number || order.id} received`,
    type: 'order', notification_type: 'new_order', related_entity_type: 'order',
    related_entity_id: String(order.id), source_db: 'shop', sync_updated_at: new Date().toISOString()
  };
  const { error } = await getEmployeeClient().from('notifications').upsert(notification, { onConflict: 'id' });
  if (error) throw error;
}

async function deleteOrderNotification(order) {
  if (!order || order.id === undefined || order.id === null) return;
  const { error } = await getEmployeeClient().from('notifications').delete().eq('id', notificationIdForOrder(order.id));
  if (error) throw error;
}

module.exports = { createOrderNotification, deleteOrderNotification, notificationIdForOrder };

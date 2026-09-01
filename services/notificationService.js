const { employeeClient } = require('../config/supabase');

async function createOrderNotification(order) {
  const notification = {
    title: 'New Order',
    message: `Order #${order.order_number} received`,
    type: 'order',
    notification_type: 'new_order',
    related_entity_type: 'order',
    related_entity_id: order.id
  };

  const { error } = await employeeClient.from('notifications').insert(notification);
  if (error) {
    throw error;
  }
}

module.exports = { createOrderNotification };

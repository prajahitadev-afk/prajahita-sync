const express = require('express');
const { verifyWebhook } = require('../middleware/verifyWebhook');
const { logEvent } = require('../utils/logger');
const { upsertCustomer, deleteCustomer } = require('../services/customerService');
const { upsertOrder, deleteOrder } = require('../services/orderService');
const { upsertOrderItem, deleteOrderItem } = require('../services/orderItemService');
const { upsertPayment, deletePayment } = require('../services/paymentService');
const { createOrderNotification } = require('../services/notificationService');

const router = express.Router();

const supportedTables = new Set(['customers', 'orders', 'order_items', 'payments']);

const tableHandlers = {
  customers: { upsert: upsertCustomer, remove: deleteCustomer },
  orders: { upsert: upsertOrder, remove: deleteOrder },
  order_items: { upsert: upsertOrderItem, remove: deleteOrderItem },
  payments: { upsert: upsertPayment, remove: deletePayment }
};

function getRecordId(record) {
  return record && (record.id || record.order_id || record.customer_id);
}

function validateEvent(payload) {
  if (!payload || typeof payload !== 'object') {
    return 'Webhook payload must be an object';
  }
  if (!['INSERT', 'UPDATE', 'DELETE'].includes(payload.type)) {
    return 'Webhook type must be INSERT, UPDATE, or DELETE';
  }
  if (!payload.table || typeof payload.table !== 'string') {
    return 'Webhook table is required';
  }
  if (payload.type === 'DELETE' && (!payload.old_record || typeof payload.old_record !== 'object')) {
    return 'old_record is required for DELETE events';
  }
  if (payload.type !== 'DELETE' && (!payload.record || typeof payload.record !== 'object')) {
    return 'record is required for INSERT and UPDATE events';
  }
  return null;
}

router.post('/', verifyWebhook, async (req, res) => {
  const validationError = validateEvent(req.body);
  if (validationError) {
    return res.status(400).json({ success: false, error: validationError });
  }

  const { type, table, record, old_record: oldRecord } = req.body;
  const eventRecord = type === 'DELETE' ? oldRecord : record;
  const recordId = getRecordId(eventRecord);

  if (!supportedTables.has(table)) {
    logEvent({ eventType: type, table, recordId, success: true });
    return res.status(200).json({ success: true, message: `Ignored unsupported table: ${table}` });
  }

  try {
    const handler = tableHandlers[table];

    if (type === 'DELETE') {
      await handler.remove(oldRecord);
    } else {
      await handler.upsert(record);
      if (type === 'INSERT' && table === 'orders') {
        await createOrderNotification(record);
      }
    }

    logEvent({ eventType: type, table, recordId, success: true });
    return res.status(200).json({ success: true });
  } catch (error) {
    logEvent({
      eventType: type,
      table,
      recordId,
      success: false,
      error: error.message
    });
    return res.status(500).json({
      success: false,
      error: error.message || 'Synchronization failed'
    });
  }
});

module.exports = router;

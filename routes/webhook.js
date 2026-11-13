const express = require('express');
const { verifyWebhook } = require('../middleware/verifyWebhook');
const { logEvent } = require('../utils/logger');
const { assertRecordId } = require('../utils/sync');
const { upsertCustomer, deleteCustomer } = require('../services/customerService');
const { upsertOrder, deleteOrder } = require('../services/orderService');
const { upsertOrderItem, deleteOrderItem } = require('../services/orderItemService');
const { upsertPayment, deletePayment } = require('../services/paymentService');
const { createOrderNotification, deleteOrderNotification } = require('../services/notificationService');

const router = express.Router();
const tableHandlers = {
  customers: { upsert: upsertCustomer, remove: deleteCustomer },
  orders: { upsert: upsertOrder, remove: deleteOrder },
  order_items: { upsert: upsertOrderItem, remove: deleteOrderItem },
  payments: { upsert: upsertPayment, remove: deletePayment }
};

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateEvent(payload) {
  if (!isPlainObject(payload)) return 'Webhook payload must be an object';
  if (!['INSERT', 'UPDATE', 'DELETE'].includes(payload.type)) return 'Webhook type must be INSERT, UPDATE, or DELETE';
  if (typeof payload.table !== 'string' || !payload.table.trim()) return 'Webhook table is required';
  const record = payload.type === 'DELETE' ? payload.old_record : payload.record;
  if (!isPlainObject(record)) return payload.type === 'DELETE' ? 'old_record must be an object for DELETE events' : 'record must be an object for INSERT and UPDATE events';
  if (Object.prototype.hasOwnProperty.call(tableHandlers, payload.table)) {
    try { assertRecordId(record); } catch (error) { return error.message; }
  }
  return null;
}

router.post('/', verifyWebhook, async (req, res) => {
  const validationError = validateEvent(req.body);
  if (validationError) return res.status(400).json({ success: false, error: validationError });

  const { type, table, record, old_record: oldRecord } = req.body;
  const eventRecord = type === 'DELETE' ? oldRecord : record;
  const recordId = eventRecord.id === undefined ? null : String(eventRecord.id);
  const handler = tableHandlers[table];

  if (!handler) {
    logEvent({ eventType: type, table, recordId, success: true });
    return res.status(200).json({ success: true, message: `Ignored unsupported table: ${table}` });
  }

  try {
    if (type === 'DELETE') {
      await handler.remove(oldRecord);
      if (table === 'orders') await deleteOrderNotification(oldRecord);
    } else {
      await handler.upsert(record);
      if (type === 'INSERT' && table === 'orders') await createOrderNotification(record);
    }
    logEvent({ eventType: type, table, recordId, success: true });
    return res.status(200).json({ success: true });
  } catch (error) {
    logEvent({ eventType: type, table, recordId, success: false, error: error && error.message ? error.message : 'Unknown synchronization error' });
    return res.status(502).json({ success: false, error: 'Synchronization failed; retry the webhook delivery' });
  }
});

module.exports = { router, validateEvent };

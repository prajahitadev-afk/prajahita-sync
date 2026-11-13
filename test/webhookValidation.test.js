const test = require('node:test');
const assert = require('node:assert/strict');
const { validateEvent } = require('../routes/webhook');
const { notificationIdForOrder } = require('../services/notificationService');

test('accepts a valid Shop order insert', () => {
  assert.equal(validateEvent({ type: 'INSERT', table: 'orders', record: { id: 'order-1', order_number: 'P-1' } }), null);
});

test('rejects array payloads and records', () => {
  assert.match(validateEvent([]), /payload must be an object/);
  assert.match(validateEvent({ type: 'INSERT', table: 'orders', record: [] }), /record must be an object/);
});

test('rejects unsupported event types and missing primary keys', () => {
  assert.match(validateEvent({ type: 'TRUNCATE', table: 'orders', record: { id: '1' } }), /Webhook type/);
  assert.match(validateEvent({ type: 'DELETE', table: 'orders', old_record: {} }), /primary key: id/);
});

test('requires old_record for deletes', () => {
  assert.match(validateEvent({ type: 'DELETE', table: 'customers' }), /old_record/);
});

test('order notification IDs are stable UUIDs', () => {
  const first = notificationIdForOrder('order-123');
  assert.equal(first, notificationIdForOrder('order-123'));
  assert.notEqual(first, notificationIdForOrder('order-456'));
  assert.match(first, /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

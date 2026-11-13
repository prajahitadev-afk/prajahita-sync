const { getEmployeeClient } = require('../config/supabase');

function assertRecordId(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) throw new TypeError('Webhook record must be an object');
  if (record.id === undefined || record.id === null || String(record.id).trim() === '') throw new TypeError('Webhook record is missing its primary key: id');
  return record.id;
}

async function upsertShopRecord(table, record) {
  assertRecordId(record);
  const payload = { ...record, source_db: 'shop', sync_updated_at: new Date().toISOString() };
  const { error } = await getEmployeeClient().from(table).upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}

async function deleteShopRecord(table, record) {
  const id = assertRecordId(record);
  const { error } = await getEmployeeClient().from(table).delete().eq('id', id);
  if (error) throw error;
}

module.exports = { assertRecordId, upsertShopRecord, deleteShopRecord };

const { upsertShopRecord, deleteShopRecord } = require('../utils/sync');
const upsertPayment = record => upsertShopRecord('payments', record);
const deletePayment = record => deleteShopRecord('payments', record);
module.exports = { upsertPayment, deletePayment };

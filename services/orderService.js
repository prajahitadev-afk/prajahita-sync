const { upsertShopRecord, deleteShopRecord } = require('../utils/sync');
const upsertOrder = record => upsertShopRecord('orders', record);
const deleteOrder = record => deleteShopRecord('orders', record);
module.exports = { upsertOrder, deleteOrder };

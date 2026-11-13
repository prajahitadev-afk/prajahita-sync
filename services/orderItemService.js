const { upsertShopRecord, deleteShopRecord } = require('../utils/sync');
const upsertOrderItem = record => upsertShopRecord('order_items', record);
const deleteOrderItem = record => deleteShopRecord('order_items', record);
module.exports = { upsertOrderItem, deleteOrderItem };

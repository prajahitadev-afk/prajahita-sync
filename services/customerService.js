const { upsertShopRecord, deleteShopRecord } = require('../utils/sync');
const upsertCustomer = record => upsertShopRecord('customers', record);
const deleteCustomer = record => deleteShopRecord('customers', record);
module.exports = { upsertCustomer, deleteCustomer };

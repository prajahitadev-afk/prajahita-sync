function logEvent({ eventType, table, recordId, success, error }) {
  const timestamp = new Date().toISOString();
  const details = [timestamp, eventType, table, recordId || 'unknown'].join(' ');

  if (success) {
    console.log(`[${timestamp}]\n${eventType} ${table} ${recordId || 'unknown'}\nSUCCESS`);
    return;
  }

  console.error(`[${details}]\n${eventType} ${table} ${recordId || 'unknown'}\nFAILURE: ${error}`);
}

module.exports = { logEvent };

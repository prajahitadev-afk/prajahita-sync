require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { getEmployeeClient } = require('./config/supabase');
const { router: webhookRouter } = require('./routes/webhook');

const app = express();
const port = Number.parseInt(process.env.PORT || '3000', 10);
const environment = process.env.NODE_ENV || 'development';
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port between 1 and 65535');

app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '1mb', strict: true }));
app.use(morgan('combined'));

app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'prajahita-sync' }));

app.get('/ready', async (req, res) => {
  try {
    const { error } = await getEmployeeClient().from('customers').select('id', { head: true, count: 'exact' });
    if (error) throw error;
    return res.status(200).json({ status: 'ready', service: 'prajahita-sync' });
  } catch (error) {
    console.error('Readiness check failed:', error.message);
    return res.status(503).json({ status: 'not_ready', service: 'prajahita-sync' });
  }
});

app.use('/webhook', webhookRouter);
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) return res.status(400).json({ success: false, error: 'Invalid JSON payload' });
  console.error('Unhandled request error:', error.message || error);
  return res.status(500).json({ success: false, error: 'Internal server error' });
});

let server;
function startServer() {
  server = app.listen(port, () => {
    console.log('Prajahita Sync Service Started');
    console.log(`Port: ${port}`);
    console.log(`Environment: ${environment}`);
  });
  return server;
}
function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully.`);
  if (!server) return process.exit(0);
  server.close(() => process.exit(0));
}

if (require.main === module) {
  startServer();
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
module.exports = { app, startServer };

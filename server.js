require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const webhookRouter = require('./routes/webhook');

const app = express();
const port = Number.parseInt(process.env.PORT || '3000', 10);
const environment = process.env.NODE_ENV || 'development';

app.disable('x-powered-by');
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'prajahita-sync'
  });
});

app.use('/webhook', webhookRouter);

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ success: false, error: 'Invalid JSON payload' });
  }
  console.error(`[${new Date().toISOString()}] Unhandled request error:`, error);
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
  if (!server) {
    process.exit(0);
  }
  server.close(() => process.exit(0));
}

if (require.main === module) {
  startServer();
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = { app, startServer };

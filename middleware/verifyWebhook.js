const crypto = require('node:crypto');

function verifyWebhook(req, res, next) {
  const expectedSecret = process.env.WEBHOOK_SECRET;
  const providedSecret = req.get('x-webhook-secret');
  if (!expectedSecret || !providedSecret) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const expected = Buffer.from(expectedSecret, 'utf8');
  const provided = Buffer.from(providedSecret, 'utf8');
  if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  return next();
}

module.exports = { verifyWebhook };

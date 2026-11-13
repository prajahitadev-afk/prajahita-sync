const test = require('node:test');
const assert = require('node:assert/strict');
const { verifyWebhook } = require('../middleware/verifyWebhook');

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

test('rejects missing webhook secrets', () => {
  const previous = process.env.WEBHOOK_SECRET;
  delete process.env.WEBHOOK_SECRET;
  const res = responseRecorder();
  let continued = false;
  verifyWebhook({ get: () => 'provided' }, res, () => { continued = true; });
  assert.equal(res.statusCode, 401);
  assert.equal(continued, false);
  if (previous === undefined) delete process.env.WEBHOOK_SECRET;
  else process.env.WEBHOOK_SECRET = previous;
});

test('accepts the configured webhook secret', () => {
  const previous = process.env.WEBHOOK_SECRET;
  process.env.WEBHOOK_SECRET = 'a-long-test-secret';
  const res = responseRecorder();
  let continued = false;
  verifyWebhook({ get: () => 'a-long-test-secret' }, res, () => { continued = true; });
  assert.equal(continued, true);
  if (previous === undefined) delete process.env.WEBHOOK_SECRET;
  else process.env.WEBHOOK_SECRET = previous;
});

test('rejects an incorrect webhook secret', () => {
  const previous = process.env.WEBHOOK_SECRET;
  process.env.WEBHOOK_SECRET = 'expected-secret';
  const res = responseRecorder();
  verifyWebhook({ get: () => 'wrong' }, res, () => assert.fail('next must not run'));
  assert.equal(res.statusCode, 401);
  if (previous === undefined) delete process.env.WEBHOOK_SECRET;
  else process.env.WEBHOOK_SECRET = previous;
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app';
test('API health, invalid JSON, bad images, unknown routes and rate limiting', async () => {
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address() as { port: number };
  const base = `http://127.0.0.1:${address.port}`;
  try {
    assert.equal((await fetch(`${base}/api/health`)).status, 200);
    assert.equal((await fetch(`${base}/api/missing`)).status, 404);
    for (const body of ['{}', '{', '{"imageBase64":123}', '{"imageBase64":"abcd"}']) {
      const res = await fetch(`${base}/api/diagnose`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      assert.equal(res.status, 400);
      assert.equal('debug' in await res.json(), false);
    }
    for (let i = 0; i < 6; i++) await fetch(`${base}/api/diagnose`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal((await fetch(`${base}/api/diagnose`, { method: 'POST' })).status, 429);
  } finally { await new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve())); }
});

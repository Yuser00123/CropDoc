import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diagnose, configuredProviders } from '../server/providers';
const env = { GEMINI_API_KEY: 'test', GEMINI_MODEL: 'test-vision', GROQ_API_KEY: 'test', GROQ_MODEL: 'test-backup' };
test('only complete model/key pairs are enabled', () => {
  assert.equal(configuredProviders({ GEMINI_API_KEY: 'test' }).length, 0);
  assert.equal(configuredProviders(env).length, 2);
});
test('invalid primary output triggers backup and passes bounded abort signal', async () => {
  let calls = 0;
  const transport = (async (_url, options) => {
    assert.ok(options?.signal);
    calls++;
    return Response.json(calls === 1 ? { candidates: [{ content: { parts: [{ text: '{}' }] } }] } : { choices: [{ message: { content: '{"is_plant_leaf":false,"error_message":"Not a leaf"}' } }] });
  }) as typeof fetch;
  const result = await diagnose('abcd', 'hi', 'Tomato', 'Lucknow', new AbortController().signal, transport, env);
  assert.equal(calls, 2); assert.equal(result.provider, 'groq'); assert.equal(result.fallbackUsed, true);
});
test('all provider failures produce an error, not a fabricated diagnosis', async () => {
  await assert.rejects(diagnose('abcd', 'en', '', '', new AbortController().signal, (async () => Response.json({}, { status: 429 })) as typeof fetch, env), /UNAVAILABLE/);
});
test('aborted deadline prevents provider calls', async () => {
  const controller = new AbortController(); controller.abort();
  await assert.rejects(diagnose('abcd', 'en', '', '', controller.signal, (() => { throw new Error('must not call'); }) as typeof fetch, env), /DEADLINE/);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { requestSchema, parseDiagnosis, validateImage } from '../server/validation';
export const valid = { is_plant_leaf: true, plant_type: 'Tomato', disease_detected: 'Possible blight', confidence_level: 'Low', severity_level: 'Moderate', symptoms_observed: ['Spots'], likely_cause: 'Uncertain', treatment_steps: ['Consult an expert'], prevention_tips: ['Avoid wetting leaves'] };
test('rejects incomplete AI responses rather than inventing diagnoses', () => {
  for (const raw of ['{}', 'null', '{"is_plant_leaf":true}', JSON.stringify({ ...valid, confidence_level: '99%' }), JSON.stringify({ ...valid, treatment_steps: [] })]) assert.throws(() => parseDiagnosis(raw));
});
test('accepts valid plant and non-plant responses', () => {
  assert.deepEqual(parseDiagnosis(JSON.stringify(valid)), valid);
  assert.equal(parseDiagnosis('{"is_plant_leaf":false,"error_message":"Please upload a leaf"}').is_plant_leaf, false);
});
test('validates request types, context lengths and disallows test overrides', () => {
  for (const body of [{}, { imageBase64: 123 }, { imageBase64: 'abcd', simulateFallback: true }, { imageBase64: 'abcd', language: 'xx' }, { imageBase64: 'abcd', crop: 'x'.repeat(81) }]) assert.equal(requestSchema.safeParse(body).success, false);
});
test('decodes real images and rejects fake data and MIME mismatch', async () => {
  const png = await sharp({ create: { width: 10, height: 10, channels: 3, background: 'green' } }).png().toBuffer();
  assert.ok(await validateImage(png.toString('base64'), 'image/png'));
  await assert.rejects(validateImage(png.toString('base64'), 'image/jpeg'));
  await assert.rejects(validateImage('abcd', 'image/jpeg'));
  await assert.rejects(validateImage('%%%=', 'image/png'));
});

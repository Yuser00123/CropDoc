import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { diagnose } from '../server/providers';
import { validateImage } from '../server/validation';

// Opt-in: sends dataset images to configured external providers and may incur charges.
const manifestPath = process.argv[2];
if (!manifestPath) {
  console.error('Usage: npm run test:eval -- /path/to/manifest.json [results.json]');
  process.exit(1);
}
const entries = z.array(z.object({
  id: z.string(), file: z.string(), mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  isPlant: z.boolean(), expectedCondition: z.string().optional(),
  language: z.enum(['en', 'hi']).default('en'), crop: z.string().default(''), location: z.string().default(''),
})).min(1).parse(JSON.parse(await fs.readFile(manifestPath, 'utf8')));
const results = [];
for (const entry of entries) {
  const start = Date.now();
  try {
    const bytes = await fs.readFile(path.resolve(path.dirname(manifestPath), entry.file));
    const image = await validateImage(bytes.toString('base64'), entry.mimeType);
    const response = await diagnose(image, entry.language, entry.crop, entry.location, AbortSignal.timeout(35000));
    results.push({ id: entry.id, elapsedMs: Date.now() - start, expectedCondition: entry.expectedCondition,
      plantGuardrailCorrect: response.data.is_plant_leaf === entry.isPlant, response, expertReview: 'PENDING' });
  } catch { results.push({ id: entry.id, elapsedMs: Date.now() - start, error: 'Request or image validation failed' }); }
}
const completed = results.filter(row => 'response' in row);
const summary = { total: results.length, completed: completed.length,
  plantGuardrailCorrect: completed.filter(row => row.plantGuardrailCorrect).length,
  note: 'Not a disease accuracy score. Expert review of condition, treatment safety and Hindi quality is required.', results };
const output = process.argv[3] || 'evaluation-results.json';
await fs.writeFile(output, JSON.stringify(summary, null, 2) + '\n');
console.log(`Saved ${results.length} evaluation rows to ${output}. Review manually before making performance claims.`);

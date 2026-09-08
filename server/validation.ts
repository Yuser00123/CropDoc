import { z } from 'zod';
import sharp from 'sharp';

const text = z.string().trim().min(1).max(2000);
export const diagnosisSchema = z.discriminatedUnion('is_plant_leaf', [
  z.object({ is_plant_leaf: z.literal(false), error_message: text }),
  z.object({
    is_plant_leaf: z.literal(true), plant_type: text, disease_detected: text,
    confidence_level: z.enum(['High', 'Medium', 'Low']),
    severity_level: z.enum(['Mild', 'Moderate', 'Severe']),
    symptoms_observed: z.array(text).min(1).max(12), likely_cause: text,
    treatment_steps: z.array(text).min(1).max(12), prevention_tips: z.array(text).min(1).max(12),
  }),
]);
export const requestSchema = z.object({
  imageBase64: z.string().min(1).max(8_000_000),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']).default('image/jpeg'),
  language: z.enum(['en', 'hi']).default('en'),
  crop: z.string().trim().max(80).default(''),
  location: z.string().trim().max(120).default(''),
}).strict();
export async function validateImage(base64: string, mime: string) {
  const raw = base64.replace(/^data:image\/(jpeg|png|webp);base64,/, '');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(raw) || raw.length % 4 !== 0) throw new Error('Invalid base64');
  const bytes = Buffer.from(raw, 'base64');
  if (bytes.length > 5 * 1024 * 1024) throw new Error('Image exceeds 5 MB');
  const image = sharp(bytes, { limitInputPixels: 25_000_000 });
  const metadata = await image.metadata();
  if (`image/${metadata.format}` !== mime) throw new Error('Image type mismatch');
  // Decode, resize, and strip metadata before sending to an external provider.
  return (await image.resize(1024, 1024, { fit: 'inside', withoutEnlargement: true }).jpeg().toBuffer()).toString('base64');
}
export function parseDiagnosis(content: string) {
  return diagnosisSchema.parse(JSON.parse(content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()));
}

# Evaluation and judging checklist

No diagnostic accuracy or live provider availability has been established by the automated tests. They use mocked provider responses. Run the following before judging.

## Build an honest evaluation set

Collect 20–30 images with permission and record the source/license. Include healthy crops, independently labeled diseases, visually similar conditions, blurry images, and non-plants. Include regionally relevant crops and both languages. Do not treat AI-generated labels, sample card titles, or stock-photo descriptions as ground truth. Keep datasets out of Git (`datasets/` is ignored).

Have an agronomist or a trustworthy labeled dataset establish expected conditions. Record any uncertainty. The existing spotted-leaf sample is a demonstration image, not verified ground truth; its original provenance/license should be confirmed before public redistribution. The non-plant shapes sample is locally generated and is only a guardrail check.

Example manifest (paths relative to the manifest):

```json
[
  {"id":"healthy-01","file":"healthy.jpg","mimeType":"image/jpeg","isPlant":true,"expectedCondition":"Healthy","language":"en","crop":"Tomato","location":"Lucknow"},
  {"id":"object-01","file":"object.png","mimeType":"image/png","isPlant":false,"language":"hi"}
]
```

With key/model pairs configured, run:

```sh
npm run test:eval -- datasets/manifest.json evaluation-results.json
```

This explicitly sends images and context to external providers and can incur charges. The runner bypasses the HTTP rate limiter, calls sequentially, and has a 35-second deadline per assessment. Output contains model/provider, timings, responses, and plant-guardrail agreement. Review disease correctness, safe advice, and Hindi quality manually; exact string matching is not diagnostic evaluation. Include failed requests in the reported denominator. Report sample count and methodology alongside any metrics; do not extrapolate to field accuracy.

## Before the demo

- Configure current vision-capable model IDs from each provider account; test each provider separately, then fallback.
- Fresh clone: `npm ci`, `npm run lint`, `npm test`, `npm run build`, `npm start`.
- Verify `/api/health` reports `aiConfigured: true` (configuration presence, not successful authentication).
- Upload a real photo; add crop/district; explicitly submit; inspect the assessment.
- Try English/Hindi, non-plant shapes, bad files, low confidence, severe disease, retry, reset, and printing.
- Language switching re-runs assessment, not a deterministic translation; explain that results may differ.
- Test mobile layout, keyboard navigation, slow connection, exhausted API quota, and unavailable providers.
- Save a short backup recording of a real successful run. Clearly label recordings or pre-recorded examples; do not present them as live inference.
- Confirm image rights, team authorship, event rules on existing code/AI assistance, and the deployed URL.

## Deployment limits

The in-memory limiter is suitable for a single-process demo, not distributed abuse protection. Set `TRUST_PROXY_HOPS` only after verifying the actual proxy topology. Never blindly trust all forwarded IPs. For public deployment add platform-level quotas/budget limits and a shared limiter if scaling. Security headers deliberately allow preview embedding; tighten CSP/frame policy on a dedicated deployment. No photos are persisted by this app, but provider retention rules still apply. Do not upload personal information.

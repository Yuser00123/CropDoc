# CropDoc AI

**English/Hindi AI-assisted crop-health assessment for a hackathon prototype.**

Upload a leaf photo, optionally specify the crop and district/state, and receive a preliminary assessment with visible symptoms, possible causes, safe next steps, and prevention guidance. This is not a validated plant-disease classifier or a substitute for an agronomist.
---

## 🌿 Problem Statement

Agriculture forms the economic and nutritional backbone for millions of households. Yet every farming season, smallholder farmers and growers face devastating crop losses—often between **20% to 40% of their total yield**—due to plant pests, blights, nutrient deficiencies, and fungal infections.

In rural and underserved agrarian belts:
- **Access to Agricultural Extension Officers is Limited**: The ratio of agronomists or plant pathologists to farmers is heavily imbalanced; getting an expert to visit a field in person can take days or weeks.
- **Delayed & Inaccurate Diagnosis**: Early signs of foliar blight, mildew, or viral mosaic are frequently mistaken for simple water stress or general nutrient shortfall. By the time lesions become obvious, the infection has often colonized the crop canopy.
- **Costly or Harmful Misapplications**: Without an exact diagnosis, farmers often guess and apply inappropriate chemical fungicides or broad-spectrum pesticides, burning crops, depleting soil biology, and wasting scarce capital.

---

## 💡 Solution Overview

**CropDoc AI** is a lightweight, mobile-first plant pathology companion designed to turn any smartphone or browser into an on-demand agricultural clinic. 

Farmers simply take or upload a photo of a diseased crop leaf. Within seconds, CropDoc AI delivers a structured, actionable diagnosis:
- **Exact Plant & Disease Identification**: Pinpoints specific pathogens (e.g., Tomato Early Blight, Powdery Mildew, Bacterial Leaf Streak) or confirms whether the leaf is healthy.
- **Observable Symptoms & Underlying Cause**: Explains why the disease occurred (fungal spore splash, high humidity, insect vectors, or nutrient imbalance).
- **Graded Severity Level**: Categorizes severity as *Mild*, *Moderate*, or *Severe* with color-coded alerts to guide immediate response.
- **Actionable Treatment Protocol**: Offers step-by-step guidance combining organic cultural practices (neem sprays, pruning, irrigation adjustments) and approved targeted treatments.
- **Preventive Best Practices**: Equips the farmer with long-term prevention strategies (crop rotation, resistant cultivars, optimal plant spacing).
- **Bilingual Interface (English & Hindi)**: Delivers all medical-botanical explanations and treatment instructions in simple, regionally accessible English or authentic Hindi (हिंदी).

---
## Features

- Photo preview and explicit submission; JPEG, PNG and WebP support.
- Optional crop/location context, without needing precise GPS or a new API.
- English/Hindi output, printable reports, and locally bundled demo samples.
- Clear uncertainty warnings and an official ICAR KVK portal link for expert help.
- Gemini → Groq → Mistral fallback, using only explicitly configured model/key pairs.
- Runtime request/response validation. Invalid model output triggers fallback rather than fabricated defaults.
- 12-second provider timeouts, a 35-second server provider-chain deadline, client cancellation and a 40-second client deadline.
- Image decoding, resizing and metadata removal on the backend; no image persistence.
- Basic request rate limiting, safe public errors, health endpoint, automated tests and CI.

There is **no claimed accuracy, uptime guarantee, or guaranteed response time**. Confidence labels are model opinions, not calibrated probabilities. Model availability, quotas, latency, disease quality and treatment safety require testing with your accounts and dataset.

## Stack

React 19, TypeScript, Vite, Tailwind CSS, Motion, Express, Zod, Sharp. Provider calls use server-side HTTP APIs; keys never enter the browser bundle.

## Run locally

Requires **Node.js 22.12+** and npm.

```sh
git clone https://github.com/Yuser00123/CropDoc.git
cd CropDoc
npm ci
cp .env.example .env
```

Configure at least one complete key/model pair in `.env`:

```dotenv
GEMINI_API_KEY=your_key
GEMINI_MODEL=your_current_vision_model_id
# Optional fallback providers, each requiring both values:
GROQ_API_KEY=
GROQ_MODEL=
MISTRAL_API_KEY=
MISTRAL_MODEL=
```

Obtain exact supported vision-model IDs from your provider account. There are deliberately no guessed defaults. Never commit `.env`. The server loads it automatically. Restart after configuration changes.

```sh
npm run dev
```

Open http://localhost:3000. `/api/health` reports whether a complete provider pair is present, not whether credentials/models have been verified. The UI can run without keys, but live assessment cannot.

## Production

```sh
npm run build
npm start
```

`npm start` sets production mode (POSIX shell), serves built assets, and binds `0.0.0.0` on `PORT` (default 3000). On Windows use WSL or set `NODE_ENV=production` before `node dist/server.cjs`. Set secrets in the deployment environment. Preview hosts under `.e2b.app` are allowed in development; browser API calls use relative URLs.

Only set `TRUST_PROXY_HOPS` to the verified number of reverse-proxy hops for your hosting topology. The limiter allows 10 diagnosis requests/minute per detected client IP and uses process-local storage; multi-instance deployment needs shared or gateway-level limiting. Keep API quotas and spending caps enabled.

## Checks

```sh
npm run lint  # TypeScript check, not an ESLint style check
npm test      # Validation, image decoding, mocked fallback, cancellation and API checks
npm run build
npm audit
```

GitHub Actions runs install, type-check, tests, build, and a high-severity dependency audit. A lockfile pins dependency resolution. A temporary `qs` override selects a patched release; review it when upgrading Express/body-parser.

## Evaluation and demo

See [the evaluation and judging checklist](docs/EVALUATION.md) for a labeled dataset protocol, opt-in live evaluation runner, and demo checklist. No evaluation results are fabricated or bundled. Most former external stock-photo samples were removed to avoid runtime network dependencies and unverified disease labels. The retained spotted-leaf image is unverified; confirm its source/license before redistribution.

Language switching on a result **reassesses the photo** in the selected language and may change the result. It is not a deterministic translation. Input context is advisory and does not provide live weather or verified local pesticide regulations.

## Safety and privacy

This prototype gives preliminary guidance only. Low-confidence or severe findings should be reviewed by an agricultural expert. Photos cannot confirm every pathogen or distinguish all nutrient/environmental issues. Check local product labels and consult an expert before chemical treatment.

Images and optional context are sent to configured external AI providers (including fallbacks). The app does not store photos, but provider data policies apply. Avoid faces, precise addresses and personal details. Do not expose provider error bodies or API keys in logs/client responses.

## Hackathon submission

Confirm the event’s rules on pre-existing work, AI-assisted coding and image licensing. Add your team details, a verified deployment URL, a short demo recording, and actual evaluation findings before submitting. Originality and eligibility are not automatically certified by this repository.

## License

See [LICENSE](LICENSE). Preserve any applicable third-party notices, and verify image rights separately.

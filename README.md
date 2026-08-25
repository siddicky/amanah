# Amanah

Defensive KYC liveness and injection-resilience scoring for Pakistani financial inclusion.

Amanah scores the **capture channel** — virtual camera / injection, replay, passive liveness, lighting, frame-rate integrity, and document bind. It does **not** generate synthetic faces, forged identity documents, or camera-injection payloads.

Built for the Alibaba Cloud AI Hackathon Pakistan 2026 (Financial Inclusion). Demo tenant: **Noor Wallet**.

## Product

| Route | What it is |
| --- | --- |
| `/` | Resilience score for the last assessment |
| `/assess` | Field / lab / hostile suite, or live on-device camera |
| `/report` | Hardening actions and inclusion notes |
| `/threats` | Detection classes (defender brief, not an attack cookbook) |
| `/pitch` | Five-slide judge walkthrough (EN / UR) |

Policy: injection is expensive to fail (25% of the overall). Lighting is cheap to fail (12%). Assist a rural Android Go capture; fail closed on a virtual camera.

## Stack

React 19, TanStack Start, Tailwind v4, Zustand. No accounts, no database — assessments persist in `localStorage`.

```bash
npm install
npm run dev      # http://localhost:8080
npm run build
npm run typecheck
```

## License

Private demo unless otherwise noted. Defensive use only.

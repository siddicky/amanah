# Amanah

Defensive KYC liveness and injection-resilience scoring for Pakistani financial inclusion.

Amanah scores the **capture channel** — virtual camera / injection, replay, passive liveness, lighting, frame-rate integrity, and document bind. It does **not** generate synthetic faces, forged identity documents, or camera-injection payloads.

Built for the Alibaba Cloud AI Hackathon Pakistan 2026 (Financial Inclusion). Demo tenants: **Noor Wallet**, **HBL Digital**, **JazzCash SIM**.

## Product

| Route | What it is |
| --- | --- |
| `/` | Resilience score for the last assessment |
| `/assess` | Field / lab / hostile suite, or live on-device camera |
| `/report` | Hardening actions, share link, Save PDF |
| `/threats` | Detection classes (defender brief, not an attack cookbook) |
| `/cloud` | Alibaba Cloud notes for the regional round |
| `/pitch` | Five-slide judge walkthrough (EN / UR) |

Wallet policy fails closed on injection only — lighting is an assist. Bank policy also fail-closes replay and document bind. Reports share as a compact URL token (scores only). Live camera scoring stays on-device.

## Stack

React 19, TanStack Start, Tailwind v4, Zustand. No accounts, no database — assessments persist in `localStorage`.

```bash
npm install
npm run dev
npm run build
npm run typecheck
```

## License

Private demo unless otherwise noted. Defensive use only.

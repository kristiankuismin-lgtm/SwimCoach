---
title: "SwimCoach Roadmap"
subtitle: "From AI-generated MVP to a product clubs adopt"
author: "SwimCoach"
date: "June 2026"
status: "Proposed"
abstract: |
  Swimming clubs hold rich training and competition data but it is scattered, so nobody can say whether
  a swimmer is developing on track or what they should train next — and the signals that drive
  development often aren't captured at all. SwimCoach's wedge is to make individual development legible:
  one place that captures the right data and turns it into per-swimmer insight, delivered by an AI
  copilot. The current MVP has a strong data model but a fake (keyword-matching) copilot, no design
  system, and internal schema/seed drift. This roadmap sequences the work — foundation, UI redesign,
  a real copilot, then data-capture depth — on the principle that the AI is only ever as good as the
  data and the interface feeding it.
---

## Problem

Clubs sit on a lot of data — training volume, intensity, attendance, competition times — but it is
**scattered** across spreadsheets, coaches' heads, and paper. Nobody can reliably answer:

- Is this swimmer developing **on track**?
- Are they training the **right things for *their* goals** — or just copying a faster teammate, which
  works for that swimmer but not this one?
- What should change next?
- And some signals that actually drive development **aren't tracked at all**.

The wedge: make individual swimmer development *legible* — capture the right data and turn it into
per-swimmer insight and action. The AI copilot is the delivery mechanism, but it is only ever as good
as the data beneath it.

## Where the project stands

**Real strengths.** A strong, domain-correct data model: intensity zones (PK/VK/MK/MAK), strokes,
workouts→pool_sets, competitions→results→PRs, yearly goals, progress snapshots, multi-tenant + RLS, and
a `pgvector` embeddings table already scaffolded. A sensible app skeleton: role-based routing
(coach / swimmer / onboarding), Supabase realtime on the dashboard, a season-summary view driving the
coach view.

**Gaps and risks.**

- **The "AI copilot" is fake** — `lib/ai/copilot.ts` is rule-based Finnish keyword matching. The real
  GPT-4o version (`supabase/functions/copilot`) is unwired and still has broken `\!` escapes. The
  headline feature does not really exist yet.
- **No design system** — hardcoded hex everywhere, emoji instead of icons, some web-only layout that
  won't render on native, `SwimmerCard` placeholder bugs (stroke label always "VAPAA").
- **Internal inconsistency (generation drift)** — demo seed columns don't match the schema; two
  copilots; dead NativeWind config; a corrupt lockfile + a react/react-dom peer conflict (both fixed);
  RLS enabled but largely unpoliced (now fixed locally in migration `002`, which also fixed a volume
  fan-out bug in the season-summary view).
- **Data capture is thin vs. the vision** — RPE/wellness, per-set actuals, dryland detail, load and
  attendance trends are partly modeled but not captured or surfaced.

## Roadmap

### Phase zero — foundation and de-risk (~1 week, do first)

A clean, trustworthy base to build and demo on.

- Reconcile schema ↔ seed into one source of truth (fix or replace the drifted `demo_*.sql`; the local
  `seed.sql` + migration `002` already do this).
- Reproducible local backend: `supabase start` + `db reset` auto-seeds a realistic club (done locally).
- Fix the broken bits: `SwimmerCard` stroke label + native widths; remove dead NativeWind config/deps;
  complete RLS; pick one copilot path.
- Why first: you can't redesign the UI or demo the AI on a base that won't seed or build.

### Phase one — UI redesign and design system (~1–2 weeks, the adoption unlock)

A product coaches *want* to open daily — the answer to the "shit UI" feedback.

- Design tokens: color system, type scale, spacing, radii, shadow, dark mode — one theme module, zero
  hardcoded hex.
- Component library: Button / Card / Stat / Badge / Tabs / inputs / chart wrappers, native- and web-safe.
- Reskin priority screens: login → coach dashboard → swimmer detail → workout entry, with real icons.
- Make `SwimmerCard` genuinely informative: trend arrows, on-track signal, next action.
- Why here: coaches won't feed data (which the AI needs) into a UI they dislike. UI quality → data
  quality → AI quality.

### Phase two — make the AI copilot real (~1–2 weeks, the differentiator)

The "why is Emma not improving / what should she train next" experience from the vision.

- Wire a real LLM copilot end-to-end (fix/replace the edge function; call it from the app).
- Evaluate **Claude** (strong Finnish; tool-use lets the copilot *query* the data model for structured
  facts rather than rely on a pre-baked text summary — what scales to "create next week's plan" and
  "project performance in 6 months"). Confirm the exact model and pricing when building it.
- Move from "dump all summaries into the prompt" to retrieval: pull the right swimmer's history/zones/PRs
  as structured context; the `swimmer_embeddings` table already exists.
- Keep the rule-based answers as a zero-cost offline fallback.

### Phase three — close the data-capture gaps (ongoing, the moat)

Track what actually predicts development — the "data that should be tracked but isn't."

- Richer workout entry: per-set actuals, RPE / wellness / sleep, dryland detail, test sets.
- Load and attendance trends (e.g. acute:chronic load), zone distribution vs. plan over time.
- Benchmarking: percentile vs. age group / national times; "what are peers who improved doing differently?"
- Coach planning: build and assign training plans, not just log them after the fact.

### Phase four — product and business (later)

- Performance prediction once enough longitudinal data exists.
- Multi-club rollout, swimmer/parent app, exports, competition-feed integrations (e.g. Swimify).
- Network and data moats (the VC framing from the build playbook).

## Recommended next steps

- Finish Phase zero — clean base + reproducible local seed (mostly done).
- Start Phase one — design system + reskin the coach dashboard (highest visible ROI, directly answers
  the feedback).
- Spike Phase two — one real Claude-powered answer ("who's at risk and *why*") to prove the
  differentiator on real data.

## Open questions for the club

- Is there an existing Supabase project with real data to preserve or migrate?
- Who are the first real users, and which screen do they live in — coach dashboard or workout entry?
- AI provider preference and budget (Claude vs OpenAI)? Finnish-first is a strong reason to test both.
- What do coaches wish they could track but can't today? — this defines Phase three.

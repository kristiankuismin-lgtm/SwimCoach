---
title: "SwimCoach UX, Flows & Information Architecture"
subtitle: "Reorganizing the app around the coach's job, not the data model"
author: "SwimCoach"
date: "June 2026"
status: "Proposed"
abstract: |
  The data model and the new design-system primitives are solid, but the navigation is organized
  around data objects (roster, workout, competitions, AI) rather than the coach's actual loop
  (monitor → drill in → act → log). The result: two coach tabs are the same roster, the single most
  valuable screen (per-swimmer development) is a hidden push route, the copilot is a decontextualized
  chat island, and the wedge the product is built on — "who is off-track and why" — has no home. This
  doc proposes a concrete information architecture: an attention-first **Koti** landing that merges the
  two roster tabs, a promoted swimmer-detail hub that hosts contextual AI and the missing "what to do
  next" actions, a coach-side admin/goal surface, and a cleanup of the swimmer app's duplicated tabs.
---

## Why now

The layering and design-system passes are done; the app builds, seeds, and looks coherent. What it
*doesn't* do yet is guide a coach through their job. The roadmap's wedge is **individual development
legibility** — "is *this* swimmer on track, are they training the right things for *their* goals, what
should change next." Today's IA is built around nouns, and the three things that deliver that wedge —
the per-swimmer detail, a "who needs attention" view, and the copilot — are buried, missing, or
decontextualized. This is the IA pass that makes the navigation express the purpose.

## Principles

1. **Organize around the coach's loop, not the schema.** Monitor → drill in → act → log. Tabs should
   map to jobs, not tables.
2. **One destination per job.** No two tabs that are the same list. Density and search are *affordances
   within* a destination, not separate destinations.
3. **Attention is the landing.** The first thing a coach sees is "what needs me today," because that is
   the product's reason to exist. We already compute the signals (`trackStatus`, `tehoScore`) — surface
   them instead of making the coach eyeball ranked cards.
4. **Insight lives where the swimmer lives.** Per-swimmer questions get answered on the per-swimmer
   screen — including the AI. Don't make the coach leave a swimmer to ask about that swimmer.
5. **Capture stays one tap away.** Logging a session is the highest-frequency action; it keeps its own
   prominent tab.

---

## Coach IA — before and after

```
BEFORE  (5 tabs, two of them the same roster)
┌──────────┬──────────┬───────────┬────────┬──────┐
│  Ryhmä   │ Uimarit  │ Harjoitus │ Kisat  │  AI  │
│ (roster  │ (roster  │  (log)    │        │(chat │
│  cards)  │  list +  │           │        │ tab) │
│          │  search) │           │        │      │
└──────────┴──────────┴───────────┴────────┴──────┘
   both → useSeasonSummary → push /coach/swimmers/[id]
   both literally titled "Uimarit"

AFTER  (4 tabs, each a distinct job)
┌──────────────┬───────────┬────────┬──────┐
│     Koti     │ Harjoitus │ Kisat  │  AI  │
│ attention +  │  (log)    │        │ glob │
│ unified      │           │        │ ask  │
│ roster       │           │        │      │
└──────────────┴───────────┴────────┴──────┘
        │
        └─► (push) Uimari­profiili = the hub: detail + actions + "Kysy AI:lta"
        └─► (header gear) Hallinta = add swimmer / groups / goals
```

The **Ryhmä + Uimarit merge** is settled, and so is the shape: **attention and the roster live in one
tab** (Koti). The merged roster is reachable only there.

---

## Screen-by-screen flow map

```
auth/login
   └─► (coach)  Koti ──────────────────────────────────────┐
   └─► (swimmer) swimmer/index (Kehitys)                    │
                                                            │
COACH                                                       │
  Koti  (coach/index, evolved RosterScreen)                 │
    • Attention strip  → tap a flagged swimmer ─────────────┤
    • Unified roster (search · group filter · cards/list)   │
    • FAB: Harjoitus                                        │
    • Header: gear → Hallinta                               │
        │                                                   ▼
        └─► Uimariprofiili (coach/swimmers/[id])  ◄─── THE HUB
              • Goal vs actual · zones · PRs · progression
              • "Mitä seuraavaksi" insight block (det. now)
              • Actions:  Muokkaa tavoitetta │ Muistiinpano │ Kysy AI:lta
                              │                                  │
                              ▼                                  ▼
                        Tavoite-editori                   AI (with swimmer
                        (reuse onboarding                  context preloaded)
                         goal/volume/zones)

  Harjoitus  (coach/workout/new)   — unchanged flow, 4 steps
  Kisat      (coach/competitions)  — list → [id] / new
  AI         (coach/copilot)       — global ask; accepts swimmer context
  Hallinta   (coach/admin, NEW)    — swimmers · groups · goals

SWIMMER  (collapse internal tabs — see below)
  Kehitys · Harjoitukset · Kisat · Tavoitteet  (bottom tabs only)
```

---

## 1. Koti — the attention-first landing (priority #1)

**Replaces** `Ryhmä` and `Uimarit`. This is the centerpiece and the most direct expression of the
roadmap's wedge.

Structure, top to bottom:

- **Attention strip** — the "who needs me" triage, built from signals we *already* compute:
  - *Jäljessä* — `trackStatus` returns `risk` (goal % more than 5 pts behind season clock).
  - *Ei harjoitellut* — no attendance in N days (needs a small query; data exists).
  - *Teho hakoteillä* — `tehoScore` below threshold (zone split off plan).
  - *Kisat tulossa* — upcoming competitions from `useClubCompetitions`.
  Each is a tappable row that deep-links to that swimmer's hub (or a filtered roster). If nothing is
  flagged: a calm "Kaikki aikataulussa" state — itself a signal worth seeing.
- **Roster** (the merge) — the existing `SwimmerCard` ranked grid, now with:
  - **Search** (the one good thing `Uimarit` had — `filterRoster` already exists).
  - **Group filter** chips (already in `RosterScreen`).
  - **Density toggle** — rich cards ⇄ compact rows (`SwimmerListRow`), so the dense scannable list
    survives the merge instead of being a second tab.
  - One **lens vocabulary** (Tavoite/Volyymi/Harjoitukset/Teho/A–Z), replacing the duplicate "sort"
    chips. Lens drives both ranking and the card hero — keep it; drop the parallel sort concept.

**Decided: one tab.** Attention strip *above* the roster — keeps "what's wrong" and "everyone" in one
glance and kills the duplication cleanly. Revisit only if real clubs run large enough rosters (100+)
that triage and browse genuinely want separate screens.

## 2. Uimariprofiili — promote the hidden hub

`coach/swimmers/[id]` is where the entire wedge lives, yet today it's a read-only push route that
hand-rolls its own header. Promote it in capability (it stays a push route — you can't tab to "a
person"):

- **Use the shared `Header`** (consistency; it currently hardcodes `paddingTop: 56`).
- **Add the missing "action" step of the loop.** The product promises "what should change next," but
  the page is display-only. Add:
  - **Muokkaa tavoitetta** → goal editor (reuse the onboarding `volume`/`zones`/`goal` steps as a coach
    form — see §4).
  - **Muistiinpano** → a coach note on the swimmer (new, small).
  - **Kysy AI:lta tästä uimarista** → opens the copilot with this swimmer as context (see §3).
- **"Mitä seuraavaksi" insight block** — a short, plain-language read of this swimmer's state
  (deterministic for now, agent later). This is the per-swimmer answer the chat tab can't give in
  context.

## 3. Copilot — separate tab + contextual (placement settled; engine is a separate workstream)

**Placement decided:** keep a global **AI** tab *and* add contextual entry points — both, for now. The
engine is deterministic code today; a real agent may come later, and its internals (scope, read vs.
write, agent boundary, where the deterministic fallback sits) are a **separate workstream**, not part of
this IA pass. Direction so the IA can proceed:

- Keep **AI** as a global tab (ask anything about the group).
- Add **contextual entry points** that pass swimmer context in: "Kysy AI:lta" on the hub, and seeded
  prompts on Koti's attention rows ("Miksi Emma on jäljessä?").
- Architecturally, route both through one `askCopilot(question, context?)` so today's rule-based engine
  and a future agent are swappable without touching the UI.

Open questions for the copilot session: scope (group vs swimmer vs plan-generation), whether it ever
*writes* (adjusts a plan) or only reads, and where the agent boundary sits relative to the deterministic
fallback the roadmap wants to keep.

## 4. Hallinta — the missing coach setup surface

The model is coach-driven, but there is **no route** to add a swimmer, create/assign a group, or edit a
goal — onboarding exists only on the swimmer side. (The coach-driven assumption itself is still in the
air — see Open questions — but this surface is worth building under either model.) Propose a `coach/admin`
area reachable from a Koti header gear:

- **Uimarit** — add swimmer, assign to group, deactivate.
- **Ryhmät** — create/rename groups, membership.
- **Tavoitteet** — set/edit a swimmer's yearly goal. The onboarding flow
  (`baseline → volume → zones → goal`) is already a goal/baseline editor; reuse those step components as
  the coach-side editor rather than building a second one.

## 5. Swimmer app — collapse the duplicated tabs

The swimmer side has the same smell as Ryhmä/Uimarit, nested one level deeper: `SwimmerHome` (the
`Kehitys` tab) carries its **own internal tab bar** — kehitys / harjoitukset / kisat — duplicating three
of the four bottom tabs. Goal info appears in four places.

- Make `Kehitys` a single overview (volume vs goal, zone split, workout-count progress) with **no
  internal tabs** — its kisat/harjoitukset panels are already the sibling bottom tabs.
- **One home for goal info:** `Tavoitteet` owns the full goal; `Kehitys` shows only progress-against-goal.
- Drop the bespoke underline tab bar; use the shared header/segmented vocabulary.

## 6. Consistency cleanup (rides along)

- Every screen through the shared `Header` (today `SwimmerDetail` and `SwimmerHome` hand-roll theirs).
- One segmented-control / lens vocabulary across roster and any in-screen switching.
- Retire the duplicate "sort" concept in favor of "lens."

---

## What this resolves (traceability)

| Problem today | Resolved by |
|---|---|
| Ryhmä ≈ Uimarit, both titled "Uimarit" | §1 merge into Koti (one roster, density toggle + search) |
| Most valuable screen is a hidden read-only route | §2 promote Uimariprofiili to a hub with actions |
| Wedge ("who's at risk and why") has no home | §1 attention strip; §2 per-swimmer insight |
| Copilot decontextualized from the swimmer | §3 contextual entry points + `context` arg |
| Coach can't add swimmers / groups / edit goals | §4 Hallinta surface |
| Swimmer tabs duplicated inside Kehitys | §5 collapse internal tabs |
| Hand-rolled headers / split sort-vs-lens vocab | §6 consistency cleanup |

## Suggested sequencing

1. **Koti** — attention strip + roster merge (highest ROI, directly answers the wedge and your #1).
2. **Uimariprofiili hub** — shared header + actions + insight block (makes the wedge *actionable*).
3. **Swimmer-tab collapse + consistency** — small, removes confusion, cheap.
4. **Hallinta** — once the coach-driven model is confirmed (or partially, for goal editing from the hub).
5. **Copilot** — after its own design session; the contextual entry points are cheap to add once §2 exists.

## Open questions / decisions

- **Koti shape:** ✅ decided — one tab (attention above roster).
- **Copilot placement:** ✅ decided — separate AI tab + contextual entry points, both. Engine internals
  (scope, read vs. write, agent boundary, deterministic fallback) remain a separate workstream.
- **Coach-driven model:** are swimmers strictly read-only consumers, or do they self-serve onboarding /
  data entry? This decides how much of Hallinta is mandatory vs. optional.
- **Attention thresholds:** what counts as "needs attention"? (days-since-training window, teho cutoff,
  how far ahead a competition surfaces.) These are product calls, not just code.

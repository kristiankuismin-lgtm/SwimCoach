# Mobile build checklist

Run through this on every file you touch. Done = every box passes or is explicitly out of scope.
The codebase is pre-convention; a box that fails on legacy code you're editing is a thing to fix, not ignore.

## Data access
- [ ] Server reads/writes go through a named function in `lib/queries/<entity>.ts` + a TanStack Query hook.
- [ ] No `supabase.from(...)` inside a component body; no `useEffect`+`useState` load pattern for server data.
- [ ] Realtime channels live in the orchestrator and invalidate query keys (no hand-managed state mirror).
- [ ] Ids come from `use*Context` hooks; club scoping is enforced by RLS, not a client-passed id.

## Logic location
- [ ] No `useEffect` for derived state or fetching (effects only for realtime lifecycle / listeners / refs).
- [ ] Pure calc + types in `lib/*.lib.ts` / `lib/utils/*`, not in a `.tsx`.
- [ ] `*.lib.ts` imports nothing from `react-native`.
- [ ] No `useMemo`/`useCallback`/`React.memo` except where a chart/list reference genuinely needs it.

## Component split
- [ ] Orchestrator screen owns queries + params + navigation; passes data + callbacks one level down.
- [ ] Presentational children are `props → JSX`: no queries, no navigation beyond a callback, UI-only `useState`.
- [ ] A presentational component does not re-fetch a prop it was given.

## Styling
- [ ] `StyleSheet.create` against tokens in `constants/theme.ts` — no hardcoded hex, no magic numbers.
- [ ] Zone/stroke colors from `constants/zones.ts`/`strokes.ts`, not re-declared.
- [ ] No web-only CSS in native styles (no `calc(...)`, no `boxShadow` string for native).
- [ ] Safe-area handled via insets; real icons over emoji.

## Types & domain
- [ ] DB row types come from generated `types/database.ts` (`npm run db:types`) — none hand-written.
- [ ] UI strings are Finnish; enum spellings exact (`selka`, `pk/vk/mk/mak`); times formatted via `lib/utils/time.ts`.

## Routing
- [ ] New routes are files under `app/`; navigation via `router.push`, params via `useLocalSearchParams`.

## Quality
- [ ] Strict types: no `any`, no `@ts-ignore`/`eslint-disable` to compile.
- [ ] Comments explain why, not what; no divider banners or name-restating comments.
- [ ] `npx tsc --noEmit` clean; change verified by running the app (`npx expo start --web`).

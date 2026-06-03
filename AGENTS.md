# AGENTS.md — flashcards-front

## Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build (single HTML file via `vite-plugin-singlefile`) |
| `npm run preview` | Preview production build |

No test, lint, formatter, or typecheck scripts are configured. `tsconfig.json` has `strict: true`, `noUnusedLocals`, `noUnusedParameters` as the only static analysis.

## Path alias

`@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`). Use `@/components/...` etc. instead of relative imports.

## Routing

All routes defined in `src/routes/index.tsx` using react-router-dom v7:

- `/login`, `/register` — public
- `/decks`, `/decks/new`, `/decks/:deckId`, `/decks/:deckId/edit`, `/decks/:deckId/study` — protected (wrapped by `ProtectedRoute` + `AppLayout`)
- `/stats`, `/settings` — protected
- `*` — `NotFoundPage`

`ProtectedRoute` reads `useAuth()`; redirects to `/login` if unauthenticated. `AppLayout` provides sidebar + `<Outlet />`.

## State management

- **Server state:** TanStack React Query v5. `QueryClient` config: `staleTime: 30000`, `retry: 1`, `refetchOnWindowFocus: false`. Mutation errors show a sonner toast globally (except 429 rate-limit with custom message).
- **Auth state:** React Context (`AuthProvider` / `useAuth()`). Access token stored in a module-level `let` variable in `src/api/client.ts` — not in React state. On mount, provider attempts `/auth/refresh-token`; on failure, clears auth.

## API client (`src/api/client.ts`)

- Axios with `withCredentials: true` (HTTP-only cookies for refresh).
- Base URL from `VITE_API_URL` env var, defaults to `http://localhost:8080`.
- Request interceptor: attaches `Authorization: Bearer <token>`; adds `Time-Zone` header on `/auth/login`, `/auth/refresh-token`, and `/reviews/` POST requests.
- Response interceptor: **automatic silent token refresh** on 401 — queues concurrent 401s while refresh is in-flight, replays on success, calls `onAuthFailure` on failure.
- API modules (`auth.api.ts`, `decks.api.ts`, etc.) are **plain async functions** (not React hooks).

## Pagination

Cursor-based `Window<T>` response type. Pages accumulate in local `useState` inside page components via "Load more" buttons. See `src/types/api.types.ts`.

## Code conventions

- **Named exports** everywhere (only `App.tsx` and `main.tsx` use `export default`).
- **Zod** schemas in `src/lib/validators.ts`, validated via `.safeParse()` in submit handlers. Types inferred: `type LoginFormData = z.infer<typeof loginSchema>`.
- **`cn()` utility** in `src/lib/utils.ts` (hand-rolled, not `clsx`/`tailwind-merge` despite both being in deps).
- **Emoji icons** throughout (no icon library).
- **Sanitization:** `sanitizeHtml()` strips HTML tags via regex before sending user text to API.
- **Study session:** fetches all pages upfront, tracks current index + revealed state in local state.
- **Mutation pattern:** always `queryClient.invalidateQueries({ queryKey: [...] })` on success — no direct cache updates.
- **Review API:** exponential backoff on 409 Conflict (max 2 retries, base delay 250ms).

## Build quirk

`vite-plugin-singlefile` bundles all assets into a single HTML file on `npm run build`.

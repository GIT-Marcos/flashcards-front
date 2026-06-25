# AGENTS.md — flashcards-front

## Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build (single HTML file via `vite-plugin-singlefile`) |
| `npm run preview` | Preview production build |

No test, lint, formatter, or typecheck scripts are configured. `tsconfig.json` has `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` as static analysis.

## Path alias

`@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`). Use `@/components/...` etc. instead of relative imports.

## Routing

All routes defined in `src/routes/index.tsx` using react-router-dom v7:

- `/login`, `/register` — public
- `/forgot-password` — public
- `/auth/reset-password` — public
- `/reviews` — protected (wrapped by `ProtectedRoute` + `AppLayout`)
- `/decks`, `/decks/new`, `/decks/:deckId`, `/decks/:deckId/edit`, `/decks/:deckId/study` — protected (wrapped by `ProtectedRoute` + `AppLayout`)
- `/stats`, `/settings` — protected (wrapped by `ProtectedRoute` + `AppLayout`)
- `/` — redirect to `/decks` (protected, wrapped by `ProtectedRoute` + `AppLayout`)
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

Cursor-based `Window<T>` response type. Pages accumulate via `useInfiniteQuery` with `data.pages.flatMap()` inside page components. See `src/types/api.types.ts`.

## CORS

No se necesita proxy de Vite. El backend ya configura CORS correctamente:

| Configuración | Valor |
|---|---|
| `allowed-origins` | `${ALLOWED_ORIGINS:http://localhost:5173}` |
| `secure-cookie` | `true` |
| `same-site` | `None` |

- **Desarrollo:** Frontend (`localhost:5173`) → peticiones cross-origin directas a `localhost:8080`. El backend acepta `localhost:5173` como origen. Las cookies (`SameSite=None; Secure`) funcionan porque `localhost` es considerado contexto seguro por los navegadores.
- **Producción:** Se setea `VITE_API_URL` y `ALLOWED_ORIGINS` con las URLs correspondientes al deploy. El backend debe incluir todos los orígenes desde los que se sirva el frontend.
- **Preflights OPTIONS:** Se disparan en cada request autenticado (header `Authorization`) y en POSTs a `/auth/login`, `/auth/refresh-token`, `/reviews/` (header `Time-Zone`). El backend los maneja automáticamente (Spring Boot).

If in the future you want to remove preflights in development, you can add `server.proxy` in `vite.config.ts` and change `VITE_API_URL` to `''` in `.env` so that `API_URL` in `src/lib/constants.ts` becomes `''`.

## Code conventions

- **Named exports** everywhere (only `App.tsx` and `api/client.ts` use `export default`).
- **`useAuth()` hook:** Provides authentication context and state management.
- **Zod** schemas in `src/lib/validators.ts`, validated via `.safeParse()` in submit handlers. Types inferred: `type LoginFormData = z.infer<typeof loginSchema>`.
- **`cn()` utility** in `src/lib/utils.ts` (hand-rolled, not `clsx`/`tailwind-merge` despite both being in deps).
- **Emoji icons** throughout (no icon library).
- **Sanitization:** `sanitizeHtml()` in `src/lib/sanitize.ts` strips HTML tags via regex before sending user text to API.
- **UI Components:** Reusable components like `Button`, `Input`, `Card` are available in `src/components/ui/`.
- **API Error Handling:** Uses `ProblemDetail` type for structured API error responses.
- **Study session:** fetches all pages upfront, tracks current index + revealed state in local state.
- **Mutation pattern:** always `queryClient.invalidateQueries({ queryKey: [...] })` on success — no direct cache updates.
- **Review API:** exponential backoff on 409 Conflict (max 2 retries, base delay 250ms).

## AI Generation

- **API Keys:** Managed in `src/pages/SettingsPage.tsx` (sección "AI API Keys"). Query key `['api-keys']`. Functions in `src/api/api-keys.api.ts`.
- **Endpoints AI:** `src/api/ai.api.ts` — three functions: `generateCardsFromFile`, `generateDeckFromFile`, `generateDeckFromTopic`. File upload variants use `FormData` with `Content-Type: multipart/form-data`.
- **Model field:** Only rendered when provider is `OPENROUTER` (the only one that actually uses the `model` parameter from the backend). Other providers show a hint with the hardcoded default model (e.g. `gpt-4o-mini`).
- **Provider options:** Defined as `{ value, labelKey }` arrays outside components, resolved via `t(labelKey)` at render time inside `<Select>`.
- **Generation flow — DeckFormPage:** Two extra buttons ("Generate from file" / "Generate from topic") in create mode. Each opens a modal, calls the API, invalidates `['decks']`, and navigates to the new deck.
- **Generation flow — DeckDetailPage:** "Generate with AI" button next to "Add Card". Modal with file upload. Calls `generateCardsFromFile`, invalidates `['cards', id]` and `['decks']` on success.

## Build quirk

`vite-plugin-singlefile` bundles all assets into a single HTML file on `npm run build`.

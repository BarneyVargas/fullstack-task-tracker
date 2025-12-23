# Copilot instructions for Task Tracker 🔧

Summary
- Small Vite + React single-page app that uses Supabase for auth and database.
- No separate backend currently; client talks directly to Supabase via a client-side anon key.

Why this matters
- Most changes you'll make will be in the React app (`src/`) and will interact directly with Supabase tables and auth flows.

Quick start (commands)
- Start dev server: `npm run dev` ✅
- Build for production: `npm run build` ✅
- Lint: `npm run lint` ⚠️

Environment / secrets
- Client expects Vite env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `src/lib/supabaseClient.js`).
- There is a commented example server handler in `api/tasks.js` that shows using `process.env.SUPABASE_SERVICE_ROLE_KEY` for server-only actions — if you add server code, use the service role key only on the server and never commit it.

Key files & patterns (be concrete)
- `src/lib/supabaseClient.js` — single source of the client-side Supabase instance (import as `import { supabase } from '@/lib/supabaseClient'`).
- `src/App.jsx` — auth bootstrap and main task CRUD flows (uses `supabase.auth.getSession`, `supabase.auth.onAuthStateChange`, and `.from('tasks')` queries).
- `src/components/auth/LoginCard.jsx` — sign-in / sign-up flows using `supabase.auth.signInWithPassword` and `supabase.auth.signUp`.
- `src/components/tasks/TaskList.jsx` & `TaskItem.jsx` — UI and event handlers pattern: pass `onToggle`, `onEditTitle`, `onDelete` as props from parent (`App.jsx`) and keep actual DB calls in top-level components.
- `api/tasks.js` — commented server example showing how to use Supabase with a service role key for server-side CRUD if you need a backend.

Data model (observable from code)
- Table: `tasks` — fields used in code: `id`, `user_id`, `title`, `completed`, `created_at`.
- App filters tasks per-user: `.eq('user_id', user.id)` before rendering.

Coding conventions and project-specific rules
- Path alias: `@/*` maps to `src/*` (defined in `jsconfig.json` and `vite.config.js`) — prefer `@/` imports.
- UI primitives are in `src/components/ui/` and are small, exported components (named exports). Example: `Button` in `src/components/ui/button.jsx`.
- Utility function `cn()` in `src/lib/utils.js` wraps `clsx` + `tailwind-merge` — preferred for combining Tailwind classes.
- Lint rules (see `eslint.config.js`): `no-unused-vars` ignores names starting with an uppercase letter or underscore (`varsIgnorePattern: '^[A-Z_]'`) — keep this in mind when introducing temporary variables.

Behavioral patterns
- After any mutation (insert/update/delete), the app refreshes tasks by calling `loadTasks()` instead of relying on optimistic updates.
- Auth is handled client-side with Supabase and the session is tracked with `onAuthStateChange` — many components will render conditionally based on `session`.

Integration & extension notes
- If you need server-side work (webhooks, secure DB ops), follow the pattern in `api/tasks.js` and use server env vars (`SUPABASE_SERVICE_ROLE_KEY`) — do not expose service keys to the client.
- To add real-time updates later, `supabase.from('tasks').on('UPDATE' | 'INSERT' | 'DELETE', ...)` is a natural extension point.

Testing & CI
- There is no test runner configured in the repo currently — use the dev server and linting for manual verification.

Security & ops notes
- `.env` contains Vite vars used by the client. Never commit server service keys.
- When deploying (Vercel, Netlify, etc.), set Vite env vars prefixed with `VITE_` for client builds, and non-prefixed service keys for server-side functions.

How Copilot/agents should behave here
- Make minimal, focused changes: prefer updating `src/` components, utilities, or Supabase interactions.
- When editing data-access code, prefer centralizing Supabase usage in `src/lib/supabaseClient.js` and keep data mutation logic in top-level components or server functions.
- Avoid committing secrets or placing service role keys in client-side code.

Examples to reference when making edits
- Read/refresh flow: `loadTasks()` in `src/App.jsx` — shows filtering by user and how errors are surfaced via `setMsg`.
- Auth: `supabase.auth.getSession()` and `supabase.auth.onAuthStateChange` (also in `src/App.jsx`).

If anything here is unclear or you want more detail about a specific area (routes, deployment, tests), tell me which part and I'll expand or add examples. ✅

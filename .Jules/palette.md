## 2026-01-15 - [Accessible Tooltips for Icon-Only Buttons]
**Learning:** Icon-only buttons (common in floating action buttons) often lack sufficient context for users, even with `aria-label`. Combining `aria-label` with a visual `Tooltip` component significantly improves usability for all users while maintaining accessibility.
**Action:** Always wrap icon-only buttons with the design system's `Tooltip` component and ensure the tooltip text is also used as the `aria-label` fallback if not explicitly provided.

## 2026-01-15 - [Testing with Missing Environment Variables]
**Learning:** Next.js applications using `@t3-oss/env-nextjs` and Clerk can be difficult to run locally (`pnpm dev`) for frontend verification without valid production-like secrets, as mock values may cause runtime errors (500).
**Action:** Prioritize static code analysis, unit tests (`pnpm test`), and linting checks when full end-to-end local verification is blocked by missing secrets. Use `SKIP_ENV_VALIDATION=1` for build checks.

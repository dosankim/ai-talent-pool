# Error Log: React Event Handler in Server Component

## Date
2026-02-25

## Issue
Encountered an error when trying to make the admin link interactive (adding hover effects) directly within `src/app/layout.tsx`.

### Error Message / Symptoms
Next.js threw a runtime error indicating that event handlers (like `onMouseOver` and `onMouseOut`) cannot be passed to Client Components props or used within Server Components.
`layout.tsx` is a Server Component by default in Next.js App Router.

## Cause
Added inline React event handlers (`onMouseOver`, `onMouseOut`) to a typical HTML `<a>` tag inside `layout.tsx`, which is a Server Component. Server Components are rendered on the server and do not support client-side interactivity or event listeners directly.

## Solution
1. Created a new separate file: `src/components/AdminLink.tsx`.
2. Marked the new component with `"use client";` at the very top of the file to explicitly define it as a Client Component.
3. Used React state (`useState`) to handle hover states (`onMouseEnter`, `onMouseLeave`) to change the opacity styling.
4. Imported and rendered `<AdminLink />` inside `src/app/layout.tsx`.

## Lesson Learned
- **Never add interactive event listeners (`onClick`, `onMouseOver`, etc.) or React hooks (`useState`, `useEffect`) directly to files that are Server Components (like `layout.tsx` or `page.tsx` without `"use client"`).**
- If a specific piece of UI needs interactivity, extract only that small piece into a separate Client Component and import it into the Server Component. This preserves the performance benefits of Server Components for the rest of the layout/page.

# CLAUDE.md — `client/src/`

Frontend conventions. Read root `CLAUDE.md` first.

## Stack quick-ref
- React 18 + TypeScript (Vite JSX transform — **don't** `import React`).
- Routing: **Wouter**. Pages live in `pages/`, registered in `App.tsx`. Use `<Link>` or `useLocation()`, never `window.location`.
- Data: **TanStack Query v5** (object form only: `useQuery({ queryKey, ... })`). Default `queryFn` is wired in `lib/queryClient.ts` — don't override unless you must.
- Mutations: `apiRequest` from `@/lib/queryClient`. Always `queryClient.invalidateQueries({ queryKey: [...] })` after success.
- Forms: `useForm` + `<Form>` from `@/components/ui/form` + `zodResolver` against `insertXxxSchema` from `@shared/schema`.
- Styling: Tailwind. Brand vars in `index.css` use `H S% L%` (no `hsl()`).
- Icons: `lucide-react` for actions, `react-icons/si` for brand logos.
- Env: `import.meta.env.VITE_*` (never `process.env` on the client).

## Folder map
```
components/ui/   shadcn primitives — DO NOT EDIT unless asked
components/      app components
hooks/           shared hooks (useToast lives here as @/hooks/use-toast)
lib/             queryClient, utils
pages/           route components
```

## Test IDs (required)
- Interactive: `data-testid="{action}-{target}"` → `button-save-quote`, `input-users`.
- Display: `data-testid="{type}-{content}"` → `text-total-contract`.
- Repeated: append the id → `row-term-${termId}`.

## Common gotchas
- `<SelectItem>` requires a non-empty `value` prop or it crashes.
- If a form silently won't submit, log `form.formState.errors` — usually a missing field bound to a hidden value.
- `useToast` import: `from "@/hooks/use-toast"`.
- TanStack Query v5: `isPending` (not `isLoading`) for mutations.

## Patterns to follow
- Co-locate small components in the same file as their parent until they grow > ~150 lines.
- Loading UI: skeletons or spinners on `query.isLoading` / `mutation.isPending`.
- Strongly type queries with select types: `useQuery<Quote>({ queryKey: ['/api/quotes', id] })`.

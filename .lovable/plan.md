

# Comprehensive Fix and Enhancement Plan

## Build Errors to Fix (Immediate)

### 1. Missing `ProactiveInterventions` component
`src/pages/Index.tsx` line 11 imports `ProactiveInterventions` from `@/components/dashboard/ProactiveInterventions` which does not exist. The component is imported but never used in the JSX. **Fix**: Remove the unused import.

### 2. Type error on `setFormPriority`
`src/pages/Index.tsx` line 271: `onValueChange={(v: string) => setFormPriority(v)}` — `v` is `string` but state is typed as `'low' | 'medium' | 'high'`. **Fix**: Cast properly: `setFormPriority(v as 'low' | 'medium' | 'high')`.

### 3. TypeScript errors in `AIInsights.tsx` lines 299-300
`pattern.pattern` and `pattern.date` are typed as `unknown` because `discovered_patterns` is `Record<string, unknown>[]`. **Fix**: Cast to `string`: `{String(pattern.pattern)}` and `{String(pattern.date)}`.

### 4. Edge function CORS headers
All three edge functions use incomplete `Access-Control-Allow-Headers`. **Fix**: Update to include all required headers: `authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version`.

## Security Fixes

### 5. Note entries query in data export
`src/lib/dataExportZip.ts` line 63 fetches all note entries without user filter. **Fix**: First get user note IDs, then query note_entries filtered by those IDs using `.in('note_id', userNoteIds)`.

### 6. Chart XSS prevention
`src/components/ui/chart.tsx` uses `dangerouslySetInnerHTML` for CSS injection. **Fix**: Validate color values with a regex pattern before rendering.

## Performance Enhancements

### 7. Memoize expensive components
- Wrap `AIInsightsCard`, `QuickStatsBar`, `WeeklyReview` with `React.memo`
- Add `useMemo` for filtered/computed data in `AIInsights.tsx`

### 8. Optimize `useScheduleDB` queries
Currently fetches ALL tasks on every mount. Add `.eq('scheduled_date', dateString)` filter or at least a date range to reduce data transfer.

## AI Enhancements

### 9. Redeploy edge functions
After fixing CORS headers, redeploy all three edge functions to ensure they work correctly.

## Code Quality

### 10. Clean up unused imports across the codebase
Remove dead imports and ensure type safety throughout.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Remove `ProactiveInterventions` import, fix `setFormPriority` type cast |
| `src/pages/AIInsights.tsx` | Fix `unknown` to `string` casts on lines 299-300 |
| `src/lib/dataExportZip.ts` | Add user filter to note_entries query |
| `supabase/functions/ai-insights/index.ts` | Fix CORS headers |
| `supabase/functions/ai-deep-analysis/index.ts` | Fix CORS headers |
| `supabase/functions/ai-generate-questions/index.ts` | Fix CORS headers |
| `src/components/ui/chart.tsx` | Add color validation for XSS prevention |
| `src/components/home/QuickStatsBar.tsx` | Add React.memo |
| `src/components/dashboard/WeeklyReview.tsx` | Add React.memo |


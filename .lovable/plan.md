

# Theme Enhancement + Next Version Plan

## Part 1: Theme Enhancement (Dark & Light)

### 1.1 Refined Dark Theme
- Slightly warm up the dark background from pure blue-gray (`240 20% 4%`) to a richer tone (`235 18% 5%`)
- Increase card contrast: bump `--card` from `240 15% 8%` to `235 15% 9%`
- Soften `--muted-foreground` from `55%` to `58%` for better readability
- Add subtle warm accent tints to gradient meshes
- Improve glass effect: increase backdrop blur and add a faint inner highlight border

### 1.2 Polished Light Theme
The current light mode is functional but bland — pure white cards on white background with minimal depth.

**Changes:**
- Background: shift from `0 0% 100%` to a soft warm off-white `240 20% 98%`
- Card: use `0 0% 100%` (pure white) for contrast against the off-white bg
- Stronger `--border` contrast: `240 10% 85%` (from 88%)
- Richer `--muted-foreground`: `240 5% 40%` (from 46%) for better text readability
- Light mode glass: add subtle `box-shadow` with colored tint instead of flat transparent background
- Add light mode `.glass-shine` with visible shimmer (`rgba(99, 102, 241, 0.04)` tint)
- Adjust gradient-mesh for light mode: use warmer, more visible soft blobs
- Light mode glow effects: use `primary` at very low opacity for a soft brand feel
- Improve `.light .glass` with slightly more opaque card + colored top-border accent

### 1.3 Shared Theme Improvements
- Add `--surface` token (between background and card) for nested card contexts
- Add new utility class `.card-elevated` for cards that need more visual pop
- Improve focus ring visibility in both themes
- Fix `WelcomeCard` — the Sparkles icon container uses hardcoded `bg-white/80` which looks wrong in dark mode; make it theme-aware

### 1.4 Remove Remaining Hardcoded Data
- `DashboardHeader.tsx` lines 56-67: replace hardcoded stats array with real data from hooks or remove the stats bar entirely until real data is available

## Part 2: Next Version Features & Improvements

### 2.1 Architecture Improvements
- **Centralized error utility** (`src/lib/errorHandler.ts`): standardize toast-based error handling across all hooks
- **Constants file** (`src/constants/index.ts`): consolidate magic numbers (refresh intervals, limits, defaults)
- **Remove `useSchedule.ts`** (localStorage version): complete the migration to `useScheduleDB` — delete the file and update any remaining imports

### 2.2 New Features
- **Quick-add task from Home**: floating action button with mini-form (no dialog needed)
- **Daily summary notification banner**: shows at configured time with today's progress summary
- **Habit streak visualization**: mini heatmap calendar showing habit completion over last 30 days
- **Focus timer integration on Home**: show active focus session countdown directly in the home view
- **Data insights cards on Dashboard**: replace hardcoded stats with real computed metrics (completion rate, avg tasks/day, trend comparisons)

### 2.3 UX Enhancements
- **Smooth page transitions**: add shared layout animations between routes using framer-motion `AnimatePresence`
- **Skeleton loaders everywhere**: standardize loading states across all cards/sections
- **Empty state illustrations**: replace plain text empty states with lightweight SVG illustrations
- **Haptic-style micro-interactions**: subtle scale/bounce on button presses, checkbox toggling

### 2.4 Performance
- **Virtualize long lists**: use `react-virtual` for timeline and habit lists
- **Image/icon lazy loading**: defer non-critical icon imports
- **Reduce motion for accessibility**: respect `prefers-reduced-motion` media query globally

---

## Implementation Order

**Immediate (this session):**
1. Enhance dark theme tokens in `index.css`
2. Enhance light theme tokens in `index.css`
3. Add new utility classes (`.card-elevated`, surface token)
4. Fix theme-broken hardcoded colors (WelcomeCard white bg, DashboardHeader fake stats)
5. Improve glass effects for both themes

**Files to modify:**
- `src/index.css` — theme tokens + utilities
- `src/components/home/WelcomeCard.tsx` — fix hardcoded white bg
- `src/components/dashboard/DashboardHeader.tsx` — remove hardcoded stats or wire to real data
- `tailwind.config.ts` — add `surface` color token


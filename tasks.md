# Movie Match — Tasks

## Vision
Tinder-style movie swiping app for couples. Both partners swipe on movies from their shared streaming services. Match = watch tonight.

## Status: MVP Live — Needs Major Polish
Live at: https://movie-match-swipe.netlify.app
Netlify site ID: 3f6df456-0e02-4edc-a128-37a65eda5c12
Supabase: pldvqmxhxsdzxepfqylk (tables: rooms, swipes)

## Stack
- Next.js 16, Supabase Realtime, Framer Motion
- TMDB API (not yet integrated — using 50 mock movies)
- Netlify deployment, mobile-first

## Principles
- **No bandaids.** Step back, think before fixing.
- **One small thing at a time.** Break everything into the smallest manageable chunk. Do that one thing. Verify it. Test it rigorously. Only when it's perfect, move to the next. Never try everything at once.
- **Every heartbeat pass:** improve the app. If list is empty, think of something.
- **Mobile-first.** If it doesn't look great on a phone, it's broken.

---

## P0 — Critical (Shayan feedback)

### UI/Layout Overhaul
- [x] Fix mobile layout — everything is squished, misshapen, badly positioned *(2026-02-13)*
- [x] Proper card sizing — movie posters should be the hero, large and clear *(2026-02-13)*
- [x] Clean spacing, padding, typography on all screens (home, room, swiping, matches) *(2026-02-13)*
- [x] Test on real mobile viewport (375px, 390px, 414px widths) *(2026-02-13)*
- [x] Buttons properly sized and spaced, not overlapping content *(2026-02-13)*

### Movie Catalog
- [x] Integrate TMDB API for real movie data — commit 2772364. Graceful fallback to mock data without key. (2026-02-13)
- [ ] Broader selection — popular, trending, top-rated, genre-specific, hidden gems
- [ ] Filter by streaming service availability (TMDB has watch providers API)
- [ ] Paginated loading — don't just show 50 movies, continuously load more
- [ ] Randomize order so both partners don't see the same sequence every time

## P1 — User Profiles & Preferences

### Profile System
- [ ] Create a profile (name, avatar or initials)
- [ ] Select favourite genres (action, comedy, horror, romance, sci-fi, etc.)
- [ ] Profile persisted in Supabase (new `profiles` table)
- [ ] Genre preferences influence movie order (show preferred genres first)

### Match Queue
- [ ] Persistent match list — all movies you and your partner matched on
- [ ] Accessible anytime (not just during a session)
- [ ] "Pick one for tonight" — random selection from match queue
- [ ] Remove movies from queue after watching

## P2 — Watch & Rate

### Movie Watching Flow
- [ ] Mark a matched movie as "watching tonight"
- [ ] After watching: both partners rate it (1-5 stars or thumbs system)
- [ ] Rating history — see what you've watched together and how you rated
- [ ] Ratings feed back into recommendations (liked horror? show more horror)
- [ ] "Watch history" page — your shared movie journal

## P3 — Nice to Have

- [ ] Dinner mode — same swiping concept but for restaurants/recipes
- [ ] Shareable match lists (public URL)
- [ ] "Movie night" scheduling — pick a date for your matched movie
- [ ] Invite via link (not just room code)
- [ ] Push notifications for matches
- [ ] Test suite

---

## Completed
- [x] MVP skeleton — room create/join, swiping, match detection, confetti
- [x] Supabase tables (rooms, swipes) + RLS
- [x] Deployed to Netlify (movie-match-swipe.netlify.app)
- [x] Mobile-first polish pass (touch gestures, 100dvh, framer-motion drag)

---
*Created: 2026-02-12*

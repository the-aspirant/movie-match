# 🎬 Movie Match

> Swipe together. Watch together.

Like Tinder, but for deciding what to watch tonight. Both swipe, only matches show.

## ✨ Features

- 🎯 **Swipe Interface** - Tinder-style card swiping with smooth animations
- 💕 **Real-time Matching** - Instant notifications when both partners like the same movie
- 🎉 **Match Celebrations** - Confetti and animated celebrations
- 📱 **Mobile-First** - Optimized for touch devices with 100dvh viewport
- 🔄 **Live Sync** - Supabase Realtime for instant updates
- 🎬 **TMDB Integration** - Real movie data from The Movie Database API
- 📺 **Streaming Filters** - Filter by your available services
- ♾️ **Pagination** - Automatically loads more movies as you swipe

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (22 recommended)
- npm or pnpm
- Supabase account (credentials already in `.env.local`)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
# Type check
npx tsc --noEmit

# Build
npm run build

# Start production server
npm start
```

## 🌐 Deploy to Netlify

### Option 1: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Follow the prompts:
# - Build command: npm run build
# - Publish directory: .next
```

### Option 2: Netlify Dashboard

1. Connect your Git repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` (required)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (required)
   - `NEXT_PUBLIC_TMDB_API_KEY` (optional - falls back to mock data)
5. Deploy!

## 🗄️ Database Schema

The Supabase database has two tables:

### `rooms`
```sql
id: uuid (primary key)
code: text (unique, 6 chars)
streaming_services: text[]
user1_id: uuid
user2_id: uuid
created_at: timestamp
```

### `swipes`
```sql
id: uuid (primary key)
room_id: uuid (foreign key)
user_id: uuid
movie_id: text
direction: text ('left' | 'right')
created_at: timestamp
```

## 📱 Mobile Experience

Optimized for mobile with:
- ✅ Touch-friendly swipe gestures (120px threshold)
- ✅ Large touch targets (min 44px)
- ✅ Dynamic viewport height (100dvh)
- ✅ Safe area insets for notched devices
- ✅ No horizontal scroll
- ✅ Active states for touch feedback
- ✅ Bottom sheet matches list
- ✅ Haptic-style animations

## 🎨 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion 12
- **Database:** Supabase (PostgreSQL + Realtime)
- **Deployment:** Netlify (with Next.js plugin)
- **Confetti:** canvas-confetti
- **TypeScript:** Full type safety

## 🔑 Environment Variables

Create `.env.local` with:

```env
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional - TMDB (falls back to mock data if not provided)
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
```

### Getting a TMDB API Key (Free)

1. Sign up at [themoviedb.org](https://www.themoviedb.org/signup)
2. Go to Settings > API
3. Click "Request an API Key"
4. Choose "Developer" and fill out the form
5. Copy your API Key (v3 auth) to `.env.local`

**Note:** The app will work without a TMDB API key by using fallback mock data with 50 curated movies.

## 📖 How It Works

1. **Create a Room** - Pick your streaming services
2. **Share the Code** - 6-character code (e.g., MAKO42)
3. **Both Swipe** - Right for yes, left for no
4. **Matches Appear** - When both swipe right on the same movie
5. **Watch Together!** - See your matches and pick one

## 🎯 Room Code Format

Codes use a **CVDVDD** pattern for easy pronunciation:
- **C** = Consonant (BCDFGHJKLMNPQRSTVWXYZ)
- **V** = Vowel (AEIOU)
- **D** = Digit (23456789)

Examples: `MAKO42`, `RUBY87`, `FELA56`

No confusing characters (0, O, 1, I excluded).

## 🧪 Testing

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build test
npm run build
```

## 📝 Future Enhancements

- [x] Real TMDB API integration (✅ Done!)
- [ ] Real streaming availability data (currently mock)
- [ ] User accounts & history
- [ ] More than 2 people per room
- [ ] Filter by genre/rating
- [ ] Export matches to calendar
- [ ] Watch party scheduling
- [ ] PWA with offline support
- [ ] Deep linking for rooms

## 📄 License

MIT - Built for the Movie Match MVP

## 🙏 Credits

- Movie data: TMDB
- Fonts: Google Fonts (Playfair Display, DM Sans)
- Icons: Emoji
- Inspiration: Tinder (obviously 😄)

---

Made with ❤️ for movie nights that actually happen.

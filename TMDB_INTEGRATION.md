# TMDB API Integration

## Overview

Movie Match now fetches real movie data from The Movie Database (TMDB) API instead of using hardcoded mock data.

## What Changed

### 1. Updated `lib/tmdb.ts`
- Added TMDB API configuration and constants
- Created `fetchMovies()` function that fetches from TMDB API
- Implemented genre mapping from TMDB IDs to readable names
- Added automatic fallback to mock data when API key is missing
- Supports pagination (loads 20 movies at a time)
- Filters movies without posters
- Merges popular and top-rated movies for variety

### 2. Updated `app/room/[code]/page.tsx`
- Changed from synchronous `filterMoviesByServices()` to async `fetchMovies()`
- Implemented automatic pagination: loads more movies when 5 movies remaining
- Added loading state indicator for pagination
- Maintains streaming service filtering
- Prevents duplicate movies across pages

### 3. Updated Documentation
- `.env.local.example` - Added TMDB API key with instructions
- `README.md` - Added TMDB setup guide and updated features

## How It Works

### API Integration
1. **Fetches from TMDB**: Combines popular and top-rated movies
2. **Converts Format**: Maps TMDB data structure to our Movie type
3. **Generates Genres**: Converts TMDB genre IDs to readable names
4. **Handles Images**: Uses TMDB's image CDN with w500 size
5. **Mock Streaming**: Randomly assigns 1-3 streaming services (TMDB doesn't provide this easily)

### Pagination
- Initial load: 20 movies (page 1)
- Auto-load trigger: When 5 movies remaining
- Deduplication: Prevents the same movie appearing twice
- Background loading: Shows ⏳ indicator while loading

### Fallback Strategy
```
TMDB API Key Present → Fetch from TMDB API
                    ↓
           API Error / No Key
                    ↓
         Use Mock Data (50 movies)
```

## Getting a TMDB API Key (Free)

1. Sign up at [themoviedb.org](https://www.themoviedb.org/signup)
2. Go to **Settings** > **API**
3. Click **"Request an API Key"**
4. Choose **"Developer"**
5. Fill out the form (personal use is fine)
6. Copy your **API Key (v3 auth)**
7. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_TMDB_API_KEY=your_actual_key_here
   ```

## Environment Variables

```env
# Optional - Falls back to mock data if not provided
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
```

## API Endpoints Used

- `/movie/popular` - Popular movies
- `/movie/top_rated` - Top-rated movies
- `/trending/movie/week` - Trending this week

## Data Mapping

### TMDB → Movie Match

| TMDB Field | Movie Match Field | Notes |
|------------|-------------------|-------|
| `id` | `id` | Converted to string |
| `title` | `title` | Direct mapping |
| `release_date` | `year` | Extracted year |
| `poster_path` | `posterUrl` | Full CDN URL |
| `backdrop_path` | `backdrop` | Optional field |
| `genre_ids` | `genre` | Mapped to names |
| `vote_average` | `rating` | Rounded to 1 decimal |
| `overview` | `synopsis` | Direct mapping |
| N/A | `streamingOn` | Mock (1-3 random services) |

## Genre Mapping

TMDB uses numeric genre IDs. We map them to readable names:

```typescript
28 → Action
12 → Adventure
16 → Animation
35 → Comedy
80 → Crime
18 → Drama
14 → Fantasy
27 → Horror
10749 → Romance
878 → Sci-Fi
53 → Thriller
37 → Western
... (and more)
```

## Caching

TMDB API responses are cached for 1 hour using Next.js's `fetch` cache:

```typescript
{ next: { revalidate: 3600 } }
```

## Error Handling

- **No API Key**: Falls back to mock data, logs warning
- **API Error**: Falls back to mock data, logs error
- **Missing Poster**: Filters out movies without posters
- **Invalid Response**: Returns empty array, triggers fallback

## Streaming Services

⚠️ **Note**: TMDB doesn't provide easy access to streaming availability.

Current approach:
- Randomly assigns 1-3 services from our pool
- Maintains consistency within a session
- Future: Could integrate JustWatch API for real data

## Testing

### Without API Key
```bash
# Remove or comment out TMDB_API_KEY
# App will use mock data
npm run dev
```

### With API Key
```bash
# Add TMDB_API_KEY to .env.local
NEXT_PUBLIC_TMDB_API_KEY=your_key_here
npm run dev
```

### Production Build
```bash
npm run build
# ✓ Should compile successfully
```

## Performance

- **Initial Load**: ~20 movies in <1 second
- **Pagination**: Triggers when 5 movies left
- **Caching**: 1-hour cache reduces API calls
- **Images**: TMDB CDN (fast, global)
- **Fallback**: Instant (no API call needed)

## Future Improvements

1. **Real Streaming Data**: Integrate JustWatch API or TMDB Watch Providers
2. **More Filters**: Genre, rating, year range
3. **Search**: Let users search for specific movies
4. **Recommendations**: Use TMDB's recommendation engine
5. **Trending**: Add trending movies section
6. **User Ratings**: Show both TMDB and user ratings

## API Limits

TMDB API (free tier):
- **40 requests/10 seconds**
- **~1M requests/month**

Our app is well within limits:
- Caching reduces calls
- Only loads on demand
- Pagination = controlled rate

## Files Modified

1. `lib/tmdb.ts` - Core TMDB integration
2. `app/room/[code]/page.tsx` - Pagination & async loading
3. `.env.local.example` - API key documentation
4. `README.md` - Setup instructions
5. `TMDB_INTEGRATION.md` - This file

## Deployment Notes

For Netlify/Vercel:
1. Add `NEXT_PUBLIC_TMDB_API_KEY` to environment variables
2. Rebuild and deploy
3. App will use TMDB API in production

Without the key:
- App works fine with mock data
- No errors or crashes
- Still fully functional

---

✅ **Integration Complete**: Movie Match now uses real TMDB data with graceful fallback to mock data!

export type Movie = {
  id: string;
  title: string;
  year: number;
  posterUrl: string;
  backdrop?: string;
  genre: string[];
  rating: number;
  streamingOn: string[]; // Netflix, Disney+, etc.
  synopsis: string;
};

// TMDB Configuration
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Genre mapping from TMDB genre IDs to names
const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

// Mock streaming services mapping (TMDB doesn't provide this easily)
const STREAMING_SERVICES_POOL = [
  'Netflix',
  'Disney+',
  'HBO Max',
  'Prime Video',
  'Hulu',
  'Paramount+',
  'Apple TV+',
];

interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  genre_ids: number[];
  vote_average: number;
  overview: string;
}

interface TMDBResponse {
  results: TMDBMovie[];
  page: number;
  total_pages: number;
}

// Convert TMDB movie to our Movie type
function convertTMDBMovie(tmdbMovie: TMDBMovie): Movie {
  const year = tmdbMovie.release_date 
    ? parseInt(tmdbMovie.release_date.split('-')[0]) 
    : new Date().getFullYear();
  
  const genres = tmdbMovie.genre_ids
    .map(id => GENRE_MAP[id])
    .filter(Boolean);

  // Randomly assign 1-3 streaming services (realistic mock)
  const numServices = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...STREAMING_SERVICES_POOL].sort(() => Math.random() - 0.5);
  const streamingOn = shuffled.slice(0, numServices);

  return {
    id: String(tmdbMovie.id),
    title: tmdbMovie.title,
    year,
    posterUrl: tmdbMovie.poster_path 
      ? `${TMDB_IMAGE_BASE_URL}${tmdbMovie.poster_path}`
      : '/placeholder-movie.jpg',
    backdrop: tmdbMovie.backdrop_path 
      ? `${TMDB_IMAGE_BASE_URL}${tmdbMovie.backdrop_path}`
      : undefined,
    genre: genres,
    rating: Math.round(tmdbMovie.vote_average * 10) / 10,
    streamingOn,
    synopsis: tmdbMovie.overview || 'No synopsis available.',
  };
}

// Fetch movies from TMDB API
async function fetchTMDBMovies(endpoint: string, page: number = 1): Promise<Movie[]> {
  if (!TMDB_API_KEY || TMDB_API_KEY === 'placeholder') {
    console.warn('TMDB API key not configured, using mock data');
    return [];
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&page=${page}&language=en-US`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      console.error('TMDB API error:', response.status);
      return [];
    }

    const data: TMDBResponse = await response.json();
    
    // Filter out movies without posters
    return data.results
      .filter(movie => movie.poster_path)
      .map(convertTMDBMovie);
  } catch (error) {
    console.error('Failed to fetch from TMDB:', error);
    return [];
  }
}

// Fetch popular movies from TMDB
export async function fetchPopularMovies(page: number = 1): Promise<Movie[]> {
  return fetchTMDBMovies('/movie/popular', page);
}

// Fetch top-rated movies from TMDB
export async function fetchTopRatedMovies(page: number = 1): Promise<Movie[]> {
  return fetchTMDBMovies('/movie/top_rated', page);
}

// Fetch trending movies from TMDB
export async function fetchTrendingMovies(page: number = 1): Promise<Movie[]> {
  return fetchTMDBMovies('/trending/movie/week', page);
}

// Fetch a mix of movies from different sources
export async function fetchMovies(page: number = 1): Promise<Movie[]> {
  if (!TMDB_API_KEY || TMDB_API_KEY === 'placeholder') {
    // Fallback to mock data if no API key
    console.warn('Using mock movie data (TMDB API key not configured)');
    return MOCK_MOVIES.slice((page - 1) * 20, page * 20);
  }

  try {
    // Fetch a mix of popular and top-rated movies
    const [popular, topRated] = await Promise.all([
      fetchPopularMovies(page),
      fetchTopRatedMovies(page),
    ]);

    // Merge and deduplicate
    const allMovies = [...popular, ...topRated];
    const uniqueMovies = Array.from(
      new Map(allMovies.map(movie => [movie.id, movie])).values()
    );

    // Return 20 movies
    return uniqueMovies.slice(0, 20);
  } catch (error) {
    console.error('Error fetching movies, falling back to mock data:', error);
    return MOCK_MOVIES.slice((page - 1) * 20, page * 20);
  }
}

// Mock movie data with real TMDB poster URLs (fallback)
export const MOCK_MOVIES: Movie[] = [
  {
    id: '1',
    title: 'The Shawshank Redemption',
    year: 1994,
    posterUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    genre: ['Drama'],
    rating: 9.3,
    streamingOn: ['Netflix', 'Prime Video'],
    synopsis: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption.',
  },
  {
    id: '2',
    title: 'The Godfather',
    year: 1972,
    posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    genre: ['Crime', 'Drama'],
    rating: 9.2,
    streamingOn: ['Paramount+', 'Prime Video'],
    synopsis: 'The aging patriarch of an organized crime dynasty transfers control to his reluctant son.',
  },
  {
    id: '3',
    title: 'The Dark Knight',
    year: 2008,
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    genre: ['Action', 'Crime', 'Drama'],
    rating: 9.0,
    streamingOn: ['HBO Max', 'Prime Video'],
    synopsis: 'Batman faces his greatest challenge as the Joker wreaks havoc on Gotham City.',
  },
  {
    id: '4',
    title: 'Pulp Fiction',
    year: 1994,
    posterUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    genre: ['Crime', 'Drama'],
    rating: 8.9,
    streamingOn: ['Netflix', 'Hulu'],
    synopsis: 'The lives of two mob hitmen, a boxer, and a pair of diner bandits intertwine.',
  },
  {
    id: '5',
    title: 'Forrest Gump',
    year: 1994,
    posterUrl: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    genre: ['Drama', 'Romance'],
    rating: 8.8,
    streamingOn: ['Paramount+', 'Prime Video'],
    synopsis: 'Decades of American history unfold through the perspective of a simple Alabama man.',
  },
  {
    id: '6',
    title: 'Inception',
    year: 2010,
    posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    rating: 8.8,
    streamingOn: ['HBO Max', 'Netflix'],
    synopsis: 'A thief who steals corporate secrets through dream-sharing technology.',
  },
  {
    id: '7',
    title: 'The Matrix',
    year: 1999,
    posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    genre: ['Action', 'Sci-Fi'],
    rating: 8.7,
    streamingOn: ['HBO Max', 'Prime Video'],
    synopsis: 'A computer hacker learns about the true nature of his reality.',
  },
  {
    id: '8',
    title: 'Goodfellas',
    year: 1990,
    posterUrl: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg',
    genre: ['Crime', 'Drama'],
    rating: 8.7,
    streamingOn: ['HBO Max', 'Prime Video'],
    synopsis: 'The story of Henry Hill and his life in the mob.',
  },
  {
    id: '9',
    title: 'Interstellar',
    year: 2014,
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    genre: ['Adventure', 'Drama', 'Sci-Fi'],
    rating: 8.6,
    streamingOn: ['Paramount+', 'Prime Video'],
    synopsis: 'A team of explorers travel through a wormhole in space to save humanity.',
  },
  {
    id: '10',
    title: 'Parasite',
    year: 2019,
    posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    genre: ['Comedy', 'Drama', 'Thriller'],
    rating: 8.6,
    streamingOn: ['Hulu', 'Prime Video'],
    synopsis: 'Greed and class discrimination threaten the newly formed symbiotic relationship.',
  },
  {
    id: '11',
    title: 'Spirited Away',
    year: 2001,
    posterUrl: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    genre: ['Animation', 'Adventure', 'Fantasy'],
    rating: 8.6,
    streamingOn: ['HBO Max', 'Netflix'],
    synopsis: 'A girl enters a magical world where she must work to free her parents.',
  },
  {
    id: '12',
    title: 'The Green Mile',
    year: 1999,
    posterUrl: 'https://image.tmdb.org/t/p/w500/velWPhVMQeQKcxggNEU8YmIo52R.jpg',
    genre: ['Crime', 'Drama', 'Fantasy'],
    rating: 8.6,
    streamingOn: ['HBO Max', 'Prime Video'],
    synopsis: 'A death row prison guard meets a man with a mysterious gift.',
  },
  {
    id: '13',
    title: 'La La Land',
    year: 2016,
    posterUrl: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg',
    genre: ['Comedy', 'Drama', 'Music', 'Romance'],
    rating: 8.0,
    streamingOn: ['Netflix', 'Prime Video'],
    synopsis: 'An aspiring actress and jazz musician fall in love while pursuing their dreams in LA.',
  },
  {
    id: '14',
    title: 'Eternal Sunshine of the Spotless Mind',
    year: 2004,
    posterUrl: 'https://image.tmdb.org/t/p/w500/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg',
    genre: ['Drama', 'Romance', 'Sci-Fi'],
    rating: 8.3,
    streamingOn: ['Prime Video', 'Hulu'],
    synopsis: 'A couple undergo a procedure to erase each other from their memories.',
  },
  {
    id: '15',
    title: 'Amélie',
    year: 2001,
    posterUrl: 'https://image.tmdb.org/t/p/w500/nSxDa3M9aMvGVLoItzWTepQ5h5d.jpg',
    genre: ['Comedy', 'Romance'],
    rating: 8.3,
    streamingOn: ['Prime Video', 'Netflix'],
    synopsis: 'A shy waitress decides to change the lives of those around her for the better.',
  },
  {
    id: '16',
    title: 'Whiplash',
    year: 2014,
    posterUrl: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
    genre: ['Drama', 'Music'],
    rating: 8.5,
    streamingOn: ['Netflix', 'Prime Video'],
    synopsis: 'A young drummer faces a ruthless music instructor at a prestigious conservatory.',
  },
  {
    id: '17',
    title: 'Everything Everywhere All at Once',
    year: 2022,
    posterUrl: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    rating: 8.0,
    streamingOn: ['Paramount+', 'Prime Video'],
    synopsis: 'A woman must connect with parallel universe versions of herself to save the multiverse.',
  },
  {
    id: '18',
    title: 'Moonlight',
    year: 2016,
    posterUrl: 'https://image.tmdb.org/t/p/w500/4911T5FbJ9eD2Faz5Z8L7keSDuA.jpg',
    genre: ['Drama'],
    rating: 7.4,
    streamingOn: ['Netflix', 'Prime Video'],
    synopsis: 'A young black man grapples with his identity and sexuality in Miami.',
  },
  {
    id: '19',
    title: 'Her',
    year: 2013,
    posterUrl: 'https://image.tmdb.org/t/p/w500/lEIaL12hSkqqe83kgADkbUqEnvk.jpg',
    genre: ['Drama', 'Romance', 'Sci-Fi'],
    rating: 8.0,
    streamingOn: ['HBO Max', 'Prime Video'],
    synopsis: 'A lonely writer develops an unlikely relationship with an AI operating system.',
  },
  {
    id: '20',
    title: 'The Grand Budapest Hotel',
    year: 2014,
    posterUrl: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
    genre: ['Comedy', 'Drama'],
    rating: 8.1,
    streamingOn: ['Disney+', 'Prime Video'],
    synopsis: 'A legendary concierge and his protégé become embroiled in a theft and murder.',
  },
  {
    id: '21',
    title: 'Knives Out',
    year: 2019,
    posterUrl: 'https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twj48Jq4.jpg',
    genre: ['Comedy', 'Crime', 'Mystery'],
    rating: 7.9,
    streamingOn: ['Netflix', 'Prime Video'],
    synopsis: 'A detective investigates the death of a patriarch of an eccentric family.',
  },
  {
    id: '22',
    title: 'The Breakfast Club',
    year: 1985,
    posterUrl: 'https://image.tmdb.org/t/p/w500/5AJNhKJrsaiPVnhqy6vQR1O7XrX.jpg',
    genre: ['Comedy', 'Drama'],
    rating: 7.8,
    streamingOn: ['Prime Video', 'Hulu'],
    synopsis: 'Five high school students from different walks of life spend Saturday in detention.',
  },
  {
    id: '23',
    title: 'Before Sunrise',
    year: 1995,
    posterUrl: 'https://image.tmdb.org/t/p/w500/3WfgycJVAezqVvw7JjRHNcdj0uP.jpg',
    genre: ['Drama', 'Romance'],
    rating: 8.1,
    streamingOn: ['HBO Max', 'Prime Video'],
    synopsis: 'A young man and woman meet on a train and spend one night together in Vienna.',
  },
  {
    id: '24',
    title: 'Coco',
    year: 2017,
    posterUrl: 'https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg',
    genre: ['Animation', 'Adventure', 'Family'],
    rating: 8.4,
    streamingOn: ['Disney+'],
    synopsis: 'A young boy travels to the Land of the Dead to discover his family history.',
  },
  {
    id: '25',
    title: 'Arrival',
    year: 2016,
    posterUrl: 'https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg',
    genre: ['Drama', 'Sci-Fi'],
    rating: 7.9,
    streamingOn: ['Paramount+', 'Prime Video'],
    synopsis: 'A linguist works with the military to communicate with alien visitors.',
  },
  {
    id: '26',
    title: 'Blade Runner 2049',
    year: 2017,
    posterUrl: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    genre: ['Drama', 'Sci-Fi', 'Thriller'],
    rating: 8.0,
    streamingOn: ['HBO Max', 'Prime Video'],
    synopsis: "A young blade runner's discovery threatens to plunge society into chaos.",
  },
  {
    id: '27',
    title: 'The Princess Bride',
    year: 1987,
    posterUrl: 'https://image.tmdb.org/t/p/w500/gpxjoE0yvRwIhFEJgNArtKtWRbn.jpg',
    genre: ['Adventure', 'Comedy', 'Romance'],
    rating: 8.0,
    streamingOn: ['Disney+', 'Hulu'],
    synopsis: 'A fairy tale adventure about a beautiful princess and her one true love.',
  },
  {
    id: '28',
    title: 'Mad Max: Fury Road',
    year: 2015,
    posterUrl: 'https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    rating: 8.1,
    streamingOn: ['HBO Max', 'Prime Video'],
    synopsis: 'A woman rebels against a tyrannical ruler in postapocalyptic Australia.',
  },
  {
    id: '29',
    title: 'Dune',
    year: 2021,
    posterUrl: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    genre: ['Adventure', 'Sci-Fi'],
    rating: 8.0,
    streamingOn: ['HBO Max', 'Prime Video'],
    synopsis: 'A noble family becomes embroiled in a war for control of the desert planet Arrakis.',
  },
  {
    id: '30',
    title: 'Spider-Man: Into the Spider-Verse',
    year: 2018,
    posterUrl: 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
    genre: ['Action', 'Adventure', 'Animation'],
    rating: 8.4,
    streamingOn: ['Netflix', 'Prime Video'],
    synopsis: 'Teen Miles Morales teams up with Spider-People from other dimensions.',
  },
  {
    id: '31',
    title: 'The Truman Show',
    year: 1998,
    posterUrl: 'https://image.tmdb.org/t/p/w500/vuza0WqY239yBXOadKlGwJsZJFE.jpg',
    genre: ['Comedy', 'Drama', 'Sci-Fi'],
    rating: 8.2,
    streamingOn: ['Paramount+', 'Prime Video'],
    synopsis: "A man discovers his entire life is a TV show watched by millions.",
  },
  {
    id: '32',
    title: 'Encanto',
    year: 2021,
    posterUrl: 'https://image.tmdb.org/t/p/w500/4j0PNHkMr5ax3IA8tjtxcmPU3QT.jpg',
    genre: ['Animation', 'Comedy', 'Family', 'Fantasy'],
    rating: 7.2,
    streamingOn: ['Disney+'],
    synopsis: 'A Colombian girl struggles as the only member of her family without magical powers.',
  },
  {
    id: '33',
    title: 'The Social Network',
    year: 2010,
    posterUrl: 'https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg',
    genre: ['Drama'],
    rating: 7.7,
    streamingOn: ['Netflix', 'Prime Video'],
    synopsis: 'The founding of Facebook and the lawsuits that followed.',
  },
  {
    id: '34',
    title: 'Toy Story',
    year: 1995,
    posterUrl: 'https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg',
    genre: ['Animation', 'Adventure', 'Comedy', 'Family'],
    rating: 8.3,
    streamingOn: ['Disney+'],
    synopsis: 'Toys come to life when humans are not around.',
  },
  {
    id: '35',
    title: 'Inglourious Basterds',
    year: 2009,
    posterUrl: 'https://image.tmdb.org/t/p/w500/7sfbEnaARXDDhKm0CZ7D7uc2sbo.jpg',
    genre: ['Action', 'Drama', 'War'],
    rating: 8.3,
    streamingOn: ['Netflix', 'Prime Video'],
    synopsis: 'Allied soldiers plot to assassinate Nazi leaders in occupied France.',
  },
  {
    id: '36',
    title: 'The Departed',
    year: 2006,
    posterUrl: 'https://image.tmdb.org/t/p/w500/nT97ifVT2J1yMQmeq20Qblg61T.jpg',
    genre: ['Crime', 'Drama', 'Thriller'],
    rating: 8.5,
    streamingOn: ['HBO Max', 'Prime Video'],
    synopsis: 'An undercover cop and a mole in the police try to identify each other.',
  },
  {
    id: '37',
    title: 'WALL-E',
    year: 2008,
    posterUrl: 'https://image.tmdb.org/t/p/w500/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg',
    genre: ['Animation', 'Family', 'Sci-Fi'],
    rating: 8.4,
    streamingOn: ['Disney+'],
    synopsis: 'A robot left to clean Earth falls in love and follows her across the galaxy.',
  },
  {
    id: '38',
    title: 'Up',
    year: 2009,
    posterUrl: 'https://image.tmdb.org/t/p/w500/vpbaStTMt8qqXaEgnOR2EE4DNJk.jpg',
    genre: ['Animation', 'Adventure', 'Comedy', 'Family'],
    rating: 8.3,
    streamingOn: ['Disney+'],
    synopsis: 'An elderly man ties thousands of balloons to his house and flies to South America.',
  },
  {
    id: '39',
    title: 'Django Unchained',
    year: 2012,
    posterUrl: 'https://image.tmdb.org/t/p/w500/7oWY8VDWW7thTzWh3OKYRkWUlD5.jpg',
    genre: ['Drama', 'Western'],
    rating: 8.4,
    streamingOn: ['Netflix', 'Prime Video'],
    synopsis: 'A freed slave teams up with a bounty hunter to rescue his wife.',
  },
  {
    id: '40',
    title: 'No Country for Old Men',
    year: 2007,
    posterUrl: 'https://image.tmdb.org/t/p/w500/bj1v6YKF8yHqA489VFfnQvOJpnc.jpg',
    genre: ['Crime', 'Drama', 'Thriller'],
    rating: 8.1,
    streamingOn: ['Netflix', 'Prime Video'],
    synopsis: 'A hunter stumbles upon drug money and is pursued by a relentless killer.',
  },
  {
    id: '41',
    title: 'The Big Lebowski',
    year: 1998,
    posterUrl: 'https://image.tmdb.org/t/p/w500/d9BdxJH0bXV0czaOGOeLdZnJtS.jpg',
    genre: ['Comedy', 'Crime'],
    rating: 8.1,
    streamingOn: ['Prime Video', 'Hulu'],
    synopsis: 'The Dude gets mistaken for a millionaire and becomes involved in a kidnapping.',
  },
  {
    id: '42',
    title: 'The Prestige',
    year: 2006,
    posterUrl: 'https://image.tmdb.org/t/p/w500/5MXyQfz8xUP3dIFPTubhTsbFY6N.jpg',
    genre: ['Drama', 'Mystery', 'Thriller'],
    rating: 8.5,
    streamingOn: ['HBO Max', 'Prime Video'],
    synopsis: 'Two magicians engage in a bitter rivalry after a tragic accident.',
  },
  {
    id: '43',
    title: 'Finding Nemo',
    year: 2003,
    posterUrl: 'https://image.tmdb.org/t/p/w500/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg',
    genre: ['Animation', 'Adventure', 'Family'],
    rating: 8.1,
    streamingOn: ['Disney+'],
    synopsis: 'A clownfish searches the ocean for his missing son.',
  },
  {
    id: '44',
    title: 'Shutter Island',
    year: 2010,
    posterUrl: 'https://image.tmdb.org/t/p/w500/4GDy0PHYX3VRXUtwK5ysFbg3kEx.jpg',
    genre: ['Drama', 'Mystery', 'Thriller'],
    rating: 8.2,
    streamingOn: ['Paramount+', 'Prime Video'],
    synopsis: 'A U.S. Marshal investigates a disappearance at an asylum for the criminally insane.',
  },
  {
    id: '45',
    title: 'The Lion King',
    year: 1994,
    posterUrl: 'https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg',
    genre: ['Animation', 'Adventure', 'Drama', 'Family'],
    rating: 8.5,
    streamingOn: ['Disney+'],
    synopsis: 'A lion cub prince flees his kingdom only to learn the meaning of responsibility.',
  },
  {
    id: '46',
    title: 'Ratatouille',
    year: 2007,
    posterUrl: 'https://image.tmdb.org/t/p/w500/npHNjldbeTHdKKw28bJKs7lzqzj.jpg',
    genre: ['Animation', 'Comedy', 'Family'],
    rating: 8.0,
    streamingOn: ['Disney+'],
    synopsis: 'A rat who can cook makes an unusual alliance with a young kitchen worker.',
  },
  {
    id: '47',
    title: 'Howl\'s Moving Castle',
    year: 2004,
    posterUrl: 'https://image.tmdb.org/t/p/w500/6pZgH10jhpToPcf7H44xm3Qb2KF.jpg',
    genre: ['Animation', 'Adventure', 'Fantasy'],
    rating: 8.2,
    streamingOn: ['HBO Max', 'Netflix'],
    synopsis: 'A young woman is cursed with an old body and must seek a wizard to break the spell.',
  },
  {
    id: '48',
    title: 'Princess Mononoke',
    year: 1997,
    posterUrl: 'https://image.tmdb.org/t/p/w500/cMYCDADoLKLbB83g4WnJegaZimC.jpg',
    genre: ['Animation', 'Adventure', 'Fantasy'],
    rating: 8.4,
    streamingOn: ['HBO Max', 'Netflix'],
    synopsis: 'A young man battles to find a cure and finds himself in a struggle between nature and industry.',
  },
  {
    id: '49',
    title: 'The Sixth Sense',
    year: 1999,
    posterUrl: 'https://image.tmdb.org/t/p/w500/4AfSDjjCy6T5LA1TMz0Lh2HlpRs.jpg',
    genre: ['Drama', 'Mystery', 'Thriller'],
    rating: 8.1,
    streamingOn: ['Paramount+', 'Prime Video'],
    synopsis: 'A boy who communicates with spirits seeks the help of a child psychologist.',
  },
  {
    id: '50',
    title: 'Fight Club',
    year: 1999,
    posterUrl: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    genre: ['Drama'],
    rating: 8.8,
    streamingOn: ['HBO Max', 'Prime Video'],
    synopsis: 'An insomniac office worker forms an underground fight club.',
  },
];

export const STREAMING_SERVICES = [
  'Netflix',
  'Disney+',
  'HBO Max',
  'Prime Video',
  'Hulu',
  'Paramount+',
  'Apple TV+',
];

// Filter movies by streaming services
export function filterMoviesByServices(movies: Movie[], services: string[]): Movie[] {
  if (services.length === 0) return movies;
  
  return movies.filter(movie =>
    movie.streamingOn.some(service => services.includes(service))
  );
}

// Get a single movie by ID
export function getMovieById(id: string): Movie | undefined {
  return MOCK_MOVIES.find(movie => movie.id === id);
}

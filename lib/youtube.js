// ============================================
// SPONSORED VIDEO ID - Update this for promotions
// This video will always appear at the top of the feed
// ============================================
export const SPONSORED_VIDEO_ID = 'bTqzWFHVZT8'; // Replace with your sponsored video ID

// ============================================
// API KEY ROTATION SYSTEM
// Supports multiple YouTube API keys with automatic rotation
// Set YOUTUBE_API_KEYS as comma-separated keys in Vercel
// Falls back to single YOUTUBE_API_KEY if YOUTUBE_API_KEYS not set
// ============================================
function getApiKeys() {
  const multiKeys = process.env.YOUTUBE_API_KEYS;
  if (multiKeys) {
    return multiKeys.split(',').map(k => k.trim()).filter(Boolean);
  }
  const singleKey = process.env.YOUTUBE_API_KEY;
  return singleKey ? [singleKey] : [];
}

// Track which key to use next (round-robin)
let currentKeyIndex = 0;
// Track failed keys to skip them temporarily
const failedKeys = new Map(); // key -> timestamp when it failed

function getNextApiKey() {
  const keys = getApiKeys();
  if (keys.length === 0) {
    console.error('No YouTube API keys configured!');
    return '';
  }
  
  const now = Date.now();
  const KEY_COOLDOWN = 60 * 60 * 1000; // 1 hour cooldown for failed keys
  
  // Try to find a working key
  for (let i = 0; i < keys.length; i++) {
    const index = (currentKeyIndex + i) % keys.length;
    const key = keys[index];
    const failedAt = failedKeys.get(key);
    
    // Skip keys that failed recently (within cooldown period)
    if (failedAt && (now - failedAt) < KEY_COOLDOWN) {
      continue;
    }
    
    // Found a working key, update index for next call
    currentKeyIndex = (index + 1) % keys.length;
    return key;
  }
  
  // All keys are in cooldown, clear and try first key
  console.warn('All API keys in cooldown, resetting...');
  failedKeys.clear();
  currentKeyIndex = 0;
  return keys[0];
}

function markKeyAsFailed(key) {
  failedKeys.set(key, Date.now());
  console.warn(`API key marked as failed: ${key.slice(0, 10)}...`);
}

// Fetch with automatic key rotation and retry
async function fetchWithKeyRotation(url, maxRetries = 3) {
  const keys = getApiKeys();
  const totalAttempts = Math.min(maxRetries, keys.length);
  
  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    const key = getNextApiKey();
    if (!key) {
      throw new Error('No API keys available');
    }
    
    url.searchParams.set('key', key);
    
    try {
      const response = await fetch(url.toString(), {
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(8000) // 8 second timeout
      });
      
      if (response.ok) {
        return response;
      }
      
      // Check if it's a quota error (403) or rate limit (429)
      if (response.status === 403 || response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        const reason = errorData.error?.errors?.[0]?.reason || '';
        
        if (reason === 'quotaExceeded' || reason === 'rateLimitExceeded' || reason === 'dailyLimitExceeded') {
          console.warn(`API key quota exceeded, trying next key... (attempt ${attempt + 1}/${totalAttempts})`);
          markKeyAsFailed(key);
          continue; // Try next key
        }
      }
      
      // For other errors, throw immediately
      const errorText = await response.text();
      throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
      
    } catch (error) {
      // Handle timeout errors
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        console.warn(`API request timeout, trying next key... (attempt ${attempt + 1}/${totalAttempts})`);
        continue;
      }
      
      // Re-throw other errors
      throw error;
    }
  }
  
  throw new Error('All API keys exhausted or quota exceeded');
}

// Search YouTube videos with key rotation
export async function searchYoutubeVideos(query, maxResults = 10, regionCode = 'US') {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.append('q', query);
  url.searchParams.append('maxResults', maxResults.toString());
  url.searchParams.append('part', 'snippet');
  url.searchParams.append('type', 'video');
  url.searchParams.append('regionCode', regionCode);

  try {
    const response = await fetchWithKeyRotation(url);
    return await response.json();
  } catch (error) {
    console.error('YouTube search error:', error);
    throw error;
  }
}

// Get trending videos for a region using YouTube Data API with key rotation
export async function getTrendingVideos(regionCode = 'US', maxResults = 40) {
  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.append('part', 'snippet,contentDetails,statistics');
  url.searchParams.append('chart', 'mostPopular');
  url.searchParams.append('regionCode', regionCode);
  url.searchParams.append('maxResults', maxResults.toString());

  try {
    const response = await fetchWithKeyRotation(url);
    const data = await response.json();
    
    // Transform and filter to ensure valid video IDs
    const videos = (data.items || [])
      .filter(item => item.id && typeof item.id === 'string' && item.id.length > 0)
      .map(item => ({
        videoId: item.id,
        title: item.snippet?.title || '',
        description: item.snippet?.description || '',
        thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || '',
        channelTitle: item.snippet?.channelTitle || '',
        publishedAt: item.snippet?.publishedAt || '',
        viewCount: item.statistics?.viewCount || '0',
        duration: item.contentDetails?.duration || ''
      }));
    
    return { videos, total: videos.length };
  } catch (error) {
    console.error('YouTube trending fetch error:', error);
    throw error;
  }
}

// Fallback curated video IDs by region (used if API fails)
export const curatedVideosByRegion = {
  US: [
    'e-ORhEE9VVg', 'CevxZvSJLk8', 'kJQP7kiw5Fk', 'RgKAFK5djSk', 'JGwWNGJdvx8',
    'fRh_vgS2dFE', 'OPf0YbXqDm0', 'hTWKbfoikeg', 'pRpeEdMmmQ0', '60ItHLz5WEA',
    'YQHsXMglC9A', 'PT2_F-1esPk', 'LsoLEjrDogU', 'bo_efYhYU2A', 'SlPhMPnQ58k',
    '7PCkvCPvDXk', 'hp8XYHL7Pr8', 'DyDfgMOUjCI', 'Lq_r06_vvBo', 'lWA2pjMjpBs',
    'JkaxUblCGz0', 'pSUydWEqKwE', '0KSOMA3QBU0', 'NZKXkD6EgBk', 'l_MyUGq7pgs'
  ],
  IN: [
    'vTIIMJ9tUc8', 'l_MyUGq7pgs', 'YR12Z8f1Dh8', 'BddP6PYo2gs', 'aJOTlE1K90k',
    'lWA2pjMjpBs', 'cNw8A5pwbVI', 'DnJqoYY4tDY', '5V430M59Yn8', 'wDjeBNv6ip0',
    '7JJfJgyHYwU', 'pAgnJDJN4VA', 'OUMQ9J3nKQw', 'vGJTaP6anOU', 'LfWZz04-8FI',
    'kJQP7kiw5Fk', 'RgKAFK5djSk', 'fRh_vgS2dFE', 'JGwWNGJdvx8', 'e-ORhEE9VVg'
  ],
  BR: [
    'kXYiU_JCYtU', 'dE9nItQbHmI', 'yzTuBuRdAyA', 'zEf423kYPrA', 'hHW1oY26kxQ',
    'oRdxUFDoQe0', 'vYCVq3h3PkY', 'DHp9SnxYO6k', 'niqrrmev4mA', 'uG2yzY4MiYQ',
    'kJQP7kiw5Fk', 'RgKAFK5djSk', 'fRh_vgS2dFE', 'JGwWNGJdvx8', 'e-ORhEE9VVg'
  ],
  GB: [
    'fRh_vgS2dFE', 'kJQP7kiw5Fk', 'JGwWNGJdvx8', 'RgKAFK5djSk', 'e-ORhEE9VVg',
    'hT_nvWreIhg', 'lp-EO5I60KA', 'CevxZvSJLk8', 'pRpeEdMmmQ0', '60ItHLz5WEA',
    'OPf0YbXqDm0', 'YQHsXMglC9A', 'PT2_F-1esPk', 'LsoLEjrDogU', 'bo_efYhYU2A'
  ],
  JP: [
    'MRIuJYk7xII', '65BAeDpwzGY', 'FvOpPeKSf_4', 'Lq_r06_vvBo', 'bYR7rLM1AhM',
    'K_xTet06SUo', 'rOU4YiuaxAM', 'LIlZCmETvsY', 'OdaGLvKhTwQ', 'DQdV7N9pWAw',
    'kJQP7kiw5Fk', 'RgKAFK5djSk', 'fRh_vgS2dFE', 'JGwWNGJdvx8', 'e-ORhEE9VVg'
  ],
  KR: [
    'gdZLi9oWNZg', 'XQSse3b2ge4', 'gQlMMD8auMs', 'wIgXX0PRKYU', '3HqEPkE-k4w',
    'CjRbTzj3jZk', 'HYWocPF2TA0', 'rygIYlPMazo', 'QwJ9gMXKTXw', 'kJQP7kiw5Fk',
    'RgKAFK5djSk', 'fRh_vgS2dFE', 'JGwWNGJdvx8', 'e-ORhEE9VVg', 'CevxZvSJLk8'
  ],
  DE: [
    'dQw4w9WgXcQ', '9bZkp7q19f0', 'kJQP7kiw5Fk', 'JGwWNGJdvx8', 'RgKAFK5djSk',
    'fRh_vgS2dFE', 'OPf0YbXqDm0', 'hTWKbfoikeg', 'CevxZvSJLk8', 'pRpeEdMmmQ0'
  ],
  FR: [
    'dQw4w9WgXcQ', '9bZkp7q19f0', 'kJQP7kiw5Fk', 'JGwWNGJdvx8', 'RgKAFK5djSk',
    'lWA2pjMjpBs', 'OPf0YbXqDm0', 'hTWKbfoikeg', 'CevxZvSJLk8', 'fRh_vgS2dFE'
  ],
  MX: [
    'kJQP7kiw5Fk', 'RgKAFK5djSk', 'JGwWNGJdvx8', 'dQw4w9WgXcQ', '9bZkp7q19f0',
    'oRdxUFDoQe0', 'yzTuBuRdAyA', 'fRh_vgS2dFE', 'OPf0YbXqDm0', 'CevxZvSJLk8'
  ],
  DEFAULT: [
    'dQw4w9WgXcQ', '9bZkp7q19f0', 'JGwWNGJdvx8', 'kJQP7kiw5Fk', 'RgKAFK5djSk',
    'fRh_vgS2dFE', 'OPf0YbXqDm0', 'hTWKbfoikeg', 'pRpeEdMmmQ0', '60ItHLz5WEA',
    'CevxZvSJLk8', 'YQHsXMglC9A', 'PT2_F-1esPk', 'JRfuAukYTKg', 'LsoLEjrDogU',
    'e-ORhEE9VVg', 'bo_efYhYU2A', 'SlPhMPnQ58k', '7PCkvCPvDXk', 'hp8XYHL7Pr8'
  ]
};

export function getRandomVideosForRegion(regionCode, count = 20) {
  const videos = curatedVideosByRegion[regionCode] || curatedVideosByRegion.DEFAULT;
  // Shuffle and return random videos
  const shuffled = [...videos].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

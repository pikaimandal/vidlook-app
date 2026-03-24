'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { MiniKit } from '@worldcoin/minikit-js';
import { useMiniKit } from '@/components/MiniKitProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { translations, LANGUAGES, getLanguageFromCountry, t } from '@/lib/translations';
import { 
  Home, 
  User, 
  ArrowRightLeft, 
  Search, 
  Wallet,
  Play,
  Clock,
  Trophy,
  Gift,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronDown,
  Copy,
  ExternalLink,
  Coins,
  TrendingUp,
  Calendar,
  X,
  Loader2,
  LogOut,
  HelpCircle,
  Mail,
  Globe,
  AlertTriangle,
  Maximize2
} from 'lucide-react';

const LOGO_URL = '/logo.png';

// ============================================
// SPONSORED VIDEO EARN TEXT - Change this for each sponsored video
// Example: 'Earn 20 $VIDEO' for a 4-minute video
// ============================================
const SPONSORED_VIDEO_EARN_TEXT = 'Earn 30 $VIDEO';

// ============================================
// GOOGLE ADSENSE CONFIGURATION
// ============================================
const ADSENSE_CLIENT = 'ca-pub-9957027590409335';
const ADSENSE_SLOTS = {
  belowSponsoredVideo: '9168291733',
};

// Google AdSense Display Ad Component
function GoogleAdUnit({ slot, className = '' }) {
  const adRef = useRef(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // Only load ad once and if adsbygoogle is available
    if (adLoaded || !adRef.current) return;
    
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [adLoaded]);

  return (
    <div className={`ad-container my-4 ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

// ============================================
// ADSTERRA AD COMPONENTS
// ============================================

// Detect iOS devices (iPhone, iPad, iPod) - ads disabled on iOS due to App Store policies
const isIOS = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
  return /iPad|iPhone|iPod/.test(userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Cache iOS check result at module level (doesn't change during session)
let _isIOSCached = null;
const getIsIOS = () => {
  if (_isIOSCached === null) _isIOSCached = isIOS();
  return _isIOSCached;
};

// DNS prefetch + preconnect for Adsterra ad domains (runs once on first render)
let _dnsPrefetched = false;
function prefetchAdDomains() {
  if (_dnsPrefetched || typeof document === 'undefined') return;
  _dnsPrefetched = true;
  const domains = [
    'www.highperformanceformat.com',
    'pl28574038.effectivegatecpm.com',
    'www.profitabledisplaynetwork.com',
    'www.highrevenuegate.com',
  ];
  domains.forEach(domain => {
    // DNS prefetch
    const dns = document.createElement('link');
    dns.rel = 'dns-prefetch';
    dns.href = `//${domain}`;
    document.head.appendChild(dns);
    // Preconnect (establishes TCP + TLS early)
    const pc = document.createElement('link');
    pc.rel = 'preconnect';
    pc.href = `https://${domain}`;
    pc.crossOrigin = 'anonymous';
    document.head.appendChild(pc);
  });
}

// Adsterra Iframe Banner Component - each ad isolated in its own iframe
// Uses document.write for fastest loading (faster than srcdoc)
function AdsterraBanner({ adKey, width, height, className = '' }) {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const retryTimerRef = useRef(null);
  const isIOSDevice = getIsIOS();

  useEffect(() => {
    // Prefetch domains on first ad mount
    prefetchAdDomains();
  }, []);

  useEffect(() => {
    if (isIOSDevice) return;
    if (!containerRef.current) return;

    const loadAd = () => {
      // Clean up previous iframe if any
      if (iframeRef.current && iframeRef.current.parentNode) {
        iframeRef.current.parentNode.removeChild(iframeRef.current);
        iframeRef.current = null;
      }

      const iframe = document.createElement('iframe');
      iframe.style.width = `${width}px`;
      iframe.style.height = `${height}px`;
      iframe.style.maxWidth = '100%';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.scrolling = 'no';
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowtransparency', 'true');
      
      iframeRef.current = iframe;
      if (!containerRef.current) return;
      containerRef.current.appendChild(iframe);

      // Use document.write immediately after appending — fastest method
      // No srcdoc (which is async), no blob URLs, direct synchronous write
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(
          '<!DOCTYPE html><html><head>' +
          '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
          '<style>*{margin:0;padding:0;box-sizing:border-box}body{background:transparent;overflow:hidden}</style>' +
          '</head><body>' +
          '<script>atOptions={"key":"' + adKey + '","format":"iframe","height":' + height + ',"width":' + width + ',"params":{}};</' + 'script>' +
          '<script src="https://www.highperformanceformat.com/' + adKey + '/invoke.js"></' + 'script>' +
          '</body></html>'
        );
        doc.close();
      } catch (e) {
        console.warn('Ad iframe write failed for', adKey, '- retrying');
        // Retry once after 2 seconds
        retryTimerRef.current = setTimeout(() => loadAd(), 2000);
      }
    };

    // Load immediately — no delays
    loadAd();

    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (iframeRef.current && iframeRef.current.parentNode) {
        iframeRef.current.parentNode.removeChild(iframeRef.current);
        iframeRef.current = null;
      }
    };
  }, [adKey, width, height, isIOSDevice]);

  if (isIOSDevice) return null;

  return (
    <div className={`ad-container my-4 flex justify-center overflow-hidden ${className}`}>
      <div 
        ref={containerRef}
        style={{ minHeight: height, maxWidth: '100%' }}
      ></div>
    </div>
  );
}

// Adsterra Native Banner Component - for sponsored video section
// DISABLED ON iOS to comply with App Store policies
function AdsterraNativeBanner({ className = '' }) {
  const containerRef = useRef(null);
  const instanceId = useRef(`native-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [loaded, setLoaded] = useState(false);
  const hasLoadedRef = useRef(false);
  const retryTimerRef = useRef(null);
  const isIOSDevice = getIsIOS();

  useEffect(() => {
    prefetchAdDomains();
  }, []);

  useEffect(() => {
    if (isIOSDevice) return;
    if (!containerRef.current) return;
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    // Remove old scripts from previous instances
    const existingScripts = document.querySelectorAll('script[src*="cae4f95eed4d1e4f9d144c0e18d8b6da"]');
    existingScripts.forEach(s => s.remove());
    
    const existingContainers = document.querySelectorAll('[id^="container-cae4f95eed4d1e4f9d144c0e18d8b6da"]');
    existingContainers.forEach(c => {
      if (c !== containerRef.current) c.innerHTML = '';
    });

    if (containerRef.current) containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = `https://pl28574038.effectivegatecpm.com/cae4f95eed4d1e4f9d144c0e18d8b6da/invoke.js?t=${Date.now()}`;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.setAttribute('data-instance', instanceId.current);
    
    script.onerror = () => {
      console.warn('Native banner failed, retrying in 3s...');
      hasLoadedRef.current = false;
      retryTimerRef.current = setTimeout(() => {
        if (containerRef.current) {
          hasLoadedRef.current = false;
          // Force re-run by creating new script
          const retryScript = document.createElement('script');
          retryScript.src = `https://pl28574038.effectivegatecpm.com/cae4f95eed4d1e4f9d144c0e18d8b6da/invoke.js?t=${Date.now()}`;
          retryScript.async = true;
          retryScript.onload = () => setLoaded(true);
          document.body.appendChild(retryScript);
        }
      }, 3000);
    };
    
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);

    return () => {
      hasLoadedRef.current = false;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [isIOSDevice]);

  if (isIOSDevice) return null;

  return (
    <div className={`ad-container my-4 flex justify-center ${className}`}>
      <div 
        id="container-cae4f95eed4d1e4f9d144c0e18d8b6da" 
        ref={containerRef}
        data-instance={instanceId.current}
      ></div>
    </div>
  );
}

// Adsterra Ad Keys Configuration
const ADSTERRA_ADS = {
  // Below search first video: 468x60
  searchFirstVideo: { key: 'eb078d99fd9e73467084b64849ed2c56', width: 468, height: 60 },
  // Feed ads (rotate these after every 3 videos)
  feedAds: [
    { key: 'c69d985ff1c9f30a2fffc0949cb3448a', width: 160, height: 300 },
    { key: '4b93b1a293b06b300ae9666221ef96db', width: 728, height: 90 },
    { key: '1978fdba198639aeec7244e408dbd4a8', width: 160, height: 600 },
  ],
  // Search ads (rotate these after every 3 videos)
  searchAds: [
    { key: 'd0b3a57d787c66a60c224207d0cb7bf5', width: 300, height: 250 },
    { key: '05e918b3dd9acec44d85b42ef3b2063d', width: 320, height: 50 },
  ],
};
// Country code to name mapping
const COUNTRY_NAMES = {
  'AF': 'Afghanistan', 'AL': 'Albania', 'DZ': 'Algeria', 'AD': 'Andorra', 'AO': 'Angola',
  'AR': 'Argentina', 'AM': 'Armenia', 'AU': 'Australia', 'AT': 'Austria', 'AZ': 'Azerbaijan',
  'BH': 'Bahrain', 'BD': 'Bangladesh', 'BY': 'Belarus', 'BE': 'Belgium', 'BZ': 'Belize',
  'BJ': 'Benin', 'BT': 'Bhutan', 'BO': 'Bolivia', 'BA': 'Bosnia and Herzegovina', 'BW': 'Botswana',
  'BR': 'Brazil', 'BN': 'Brunei', 'BG': 'Bulgaria', 'BF': 'Burkina Faso', 'BI': 'Burundi',
  'KH': 'Cambodia', 'CM': 'Cameroon', 'CA': 'Canada', 'CV': 'Cape Verde', 'CF': 'Central African Republic',
  'TD': 'Chad', 'CL': 'Chile', 'CN': 'China', 'CO': 'Colombia', 'KM': 'Comoros',
  'CG': 'Congo', 'CD': 'DR Congo', 'CR': 'Costa Rica', 'CI': 'Ivory Coast', 'HR': 'Croatia',
  'CU': 'Cuba', 'CY': 'Cyprus', 'CZ': 'Czech Republic', 'DK': 'Denmark', 'DJ': 'Djibouti',
  'DO': 'Dominican Republic', 'EC': 'Ecuador', 'EG': 'Egypt', 'SV': 'El Salvador', 'GQ': 'Equatorial Guinea',
  'ER': 'Eritrea', 'EE': 'Estonia', 'SZ': 'Eswatini', 'ET': 'Ethiopia', 'FJ': 'Fiji',
  'FI': 'Finland', 'FR': 'France', 'GA': 'Gabon', 'GM': 'Gambia', 'GE': 'Georgia',
  'DE': 'Germany', 'GH': 'Ghana', 'GR': 'Greece', 'GT': 'Guatemala', 'GN': 'Guinea',
  'GW': 'Guinea-Bissau', 'GY': 'Guyana', 'HT': 'Haiti', 'HN': 'Honduras', 'HK': 'Hong Kong',
  'HU': 'Hungary', 'IS': 'Iceland', 'IN': 'India', 'ID': 'Indonesia', 'IR': 'Iran',
  'IQ': 'Iraq', 'IE': 'Ireland', 'IL': 'Israel', 'IT': 'Italy', 'JM': 'Jamaica',
  'JP': 'Japan', 'JO': 'Jordan', 'KZ': 'Kazakhstan', 'KE': 'Kenya', 'KW': 'Kuwait',
  'KG': 'Kyrgyzstan', 'LA': 'Laos', 'LV': 'Latvia', 'LB': 'Lebanon', 'LS': 'Lesotho',
  'LR': 'Liberia', 'LY': 'Libya', 'LI': 'Liechtenstein', 'LT': 'Lithuania', 'LU': 'Luxembourg',
  'MO': 'Macau', 'MG': 'Madagascar', 'MW': 'Malawi', 'MY': 'Malaysia', 'MV': 'Maldives',
  'ML': 'Mali', 'MT': 'Malta', 'MR': 'Mauritania', 'MU': 'Mauritius', 'MX': 'Mexico',
  'MD': 'Moldova', 'MC': 'Monaco', 'MN': 'Mongolia', 'ME': 'Montenegro', 'MA': 'Morocco',
  'MZ': 'Mozambique', 'MM': 'Myanmar', 'NA': 'Namibia', 'NP': 'Nepal', 'NL': 'Netherlands',
  'NZ': 'New Zealand', 'NI': 'Nicaragua', 'NE': 'Niger', 'NG': 'Nigeria', 'KP': 'North Korea',
  'MK': 'North Macedonia', 'NO': 'Norway', 'OM': 'Oman', 'PK': 'Pakistan', 'PA': 'Panama',
  'PG': 'Papua New Guinea', 'PY': 'Paraguay', 'PE': 'Peru', 'PH': 'Philippines', 'PL': 'Poland',
  'PT': 'Portugal', 'PR': 'Puerto Rico', 'QA': 'Qatar', 'RO': 'Romania', 'RU': 'Russia',
  'RW': 'Rwanda', 'SA': 'Saudi Arabia', 'SN': 'Senegal', 'RS': 'Serbia', 'SG': 'Singapore',
  'SK': 'Slovakia', 'SI': 'Slovenia', 'SO': 'Somalia', 'ZA': 'South Africa', 'KR': 'South Korea',
  'SS': 'South Sudan', 'ES': 'Spain', 'LK': 'Sri Lanka', 'SD': 'Sudan', 'SR': 'Suriname',
  'SE': 'Sweden', 'CH': 'Switzerland', 'SY': 'Syria', 'TW': 'Taiwan', 'TJ': 'Tajikistan',
  'TZ': 'Tanzania', 'TH': 'Thailand', 'TL': 'Timor-Leste', 'TG': 'Togo', 'TT': 'Trinidad and Tobago',
  'TN': 'Tunisia', 'TR': 'Turkey', 'TM': 'Turkmenistan', 'UG': 'Uganda', 'UA': 'Ukraine',
  'AE': 'United Arab Emirates', 'GB': 'United Kingdom', 'US': 'United States', 'UY': 'Uruguay',
  'UZ': 'Uzbekistan', 'VE': 'Venezuela', 'VN': 'Vietnam', 'YE': 'Yemen', 'ZM': 'Zambia', 'ZW': 'Zimbabwe'
};

// Global registry to track all player instances for single-video playback
const playerRegistry = new Map();

// YouTube Player Component - Using YouTube IFrame API for accurate play/pause detection
function YouTubePlayer({ videoId, onTimeUpdate, onPlay, onPause, isSponsored }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [apiReady, setApiReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const intervalRef = useRef(null);
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const accumulatedTimeRef = useRef(0);
  const lastTickRef = useRef(null);
  
  // Store callbacks in refs to avoid re-creating the player when callbacks change
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onPlayRef = useRef(onPlay);
  const onPauseRef = useRef(onPause);
  
  // Keep refs up to date
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
    onPlayRef.current = onPlay;
    onPauseRef.current = onPause;
  });

  // Load YouTube IFrame API
  useEffect(() => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Set up or chain the callback
    const checkReady = () => {
      if (window.YT && window.YT.Player) {
        setApiReady(true);
      }
    };

    if (window.onYouTubeIframeAPIReady) {
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousCallback();
        checkReady();
      };
    } else {
      window.onYouTubeIframeAPIReady = checkReady;
    }

    // Check if already ready (race condition)
    checkReady();
  }, []);

  // Pause all other players when this one starts playing
  const pauseOtherPlayers = useCallback(() => {
    playerRegistry.forEach((player, id) => {
      if (id !== videoId && player && player.pauseVideo) {
        try {
          player.pauseVideo();
        } catch (e) {
          console.warn('Failed to pause player:', id);
        }
      }
    });
  }, [videoId]);

  // Initialize player when API is ready
  useEffect(() => {
    if (!apiReady || !containerRef.current || playerRef.current) return;
    
    // Don't create player if videoId is invalid
    if (!videoId || typeof videoId !== 'string' || videoId.trim() === '') {
      console.warn('Invalid videoId, skipping player creation');
      return;
    }

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        fs: 1, // Enable fullscreen button
        origin: typeof window !== 'undefined' ? window.location.origin : '',
        enablejsapi: 1,
      },
      events: {
        onReady: () => {
          // Register player in the global registry
          playerRegistry.set(videoId, playerRef.current);
        },
        onStateChange: (event) => {
          // YouTube Player States:
          // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
          if (event.data === window.YT.PlayerState.PLAYING) {
            // Pause all other players before this one starts
            pauseOtherPlayers();
            
            setIsPlaying(true);
            lastTickRef.current = Date.now();
            if (onPlayRef.current) onPlayRef.current();
            
            // Start tracking time
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => {
              const now = Date.now();
              const delta = (now - lastTickRef.current) / 1000;
              lastTickRef.current = now;
              accumulatedTimeRef.current += delta;
              const totalTime = Math.floor(accumulatedTimeRef.current);
              setWatchTime(totalTime);
              if (onTimeUpdateRef.current) onTimeUpdateRef.current(totalTime);
            }, 1000);
          } else if (event.data === window.YT.PlayerState.PAUSED || 
                     event.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            if (onPauseRef.current) onPauseRef.current();
            
            // Stop tracking time
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          } else if (event.data === window.YT.PlayerState.BUFFERING) {
            // Don't count buffering time - pause the timer
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        },
      },
    });

    return () => {
      // Remove from registry
      playerRegistry.delete(videoId);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [apiReady, videoId, pauseOtherPlayers]);

  // Handle visibility change - pause tracking when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        // Pause the video when tab is hidden
        if (playerRef.current && playerRef.current.pauseVideo) {
          playerRef.current.pauseVideo();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying]);

  // ===== FULLSCREEN / LANDSCAPE LOGIC =====

  // Check if device is in portrait orientation
  const checkPortrait = useCallback(() => {
    return window.innerHeight > window.innerWidth;
  }, []);

  const enterFullscreen = useCallback(async () => {
    // Detect portrait before entering fullscreen
    const portrait = checkPortrait();
    setIsPortrait(portrait);
    setIsFullscreen(true);
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    // Try to lock orientation to landscape (progressive enhancement)
    try {
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('landscape');
        // If orientation lock succeeded, no CSS rotation needed
        setIsPortrait(false);
      }
    } catch (e) {
      // Orientation lock not supported in WebView - CSS rotation will handle it
    }
  }, [checkPortrait]);

  const exitFullscreen = useCallback(async () => {
    setIsFullscreen(false);
    setIsPortrait(false);
    document.body.style.overflow = '';

    // Unlock orientation
    try {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    } catch (e) {
      // Not supported
    }
  }, []);

  // Listen for orientation changes while in fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    const handleResize = () => {
      // If user physically rotated to landscape, remove CSS rotation
      setIsPortrait(checkPortrait());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen, checkPortrait]);

  // Cleanup overflow on unmount
  useEffect(() => {
    return () => {
      if (isFullscreen) {
        document.body.style.overflow = '';
        try {
          if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
          }
        } catch (e) {}
      }
    };
  }, [isFullscreen]);

  // Build fullscreen class name
  const fullscreenClass = isFullscreen
    ? `video-fullscreen-overlay${isPortrait ? ' video-fs-portrait' : ''}`
    : 'relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900';

  return (
    <div
      ref={wrapperRef}
      className={fullscreenClass}
    >
      <div ref={containerRef} className="w-full h-full" />

      {/* Fullscreen toggle button */}
      {!isFullscreen && (
        <button
          onClick={(e) => { e.stopPropagation(); enterFullscreen(); }}
          className="absolute bottom-2 right-2 bg-black/70 text-white p-1.5 rounded-md z-20 active:bg-black/90 transition-colors"
          aria-label="Enter fullscreen landscape mode"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      )}

      {/* Exit fullscreen button */}
      {isFullscreen && (
        <button
          onClick={(e) => { e.stopPropagation(); exitFullscreen(); }}
          className="absolute top-3 right-3 bg-black/70 text-white p-2.5 rounded-full z-[10001] active:bg-black/90 transition-colors"
          aria-label="Exit fullscreen"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {/* Earning indicator - hidden in fullscreen to avoid overlapping video */}
      {isPlaying && !isFullscreen && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-pulse z-10 pointer-events-none">
          <div className="w-2 h-2 bg-white rounded-full" />
          Earning {isSponsored ? '5' : '2'} $VIDEO/min
        </div>
      )}
    </div>
  );
}

// Unified Video Card Component - Works for both sponsored and regular videos
function VideoCard({ videoId, onWatch, title, isSponsored = false }) {
  const [watchTime, setWatchTime] = useState(0);
  const [sessionTokens, setSessionTokens] = useState(0);
  const [pendingMinute, setPendingMinute] = useState(false);
  const lastRecordedMinuteRef = useRef(0);

  const handleTimeUpdate = useCallback((time) => {
    setWatchTime(time);
    const currentMinute = Math.floor(time / 60);
    
    // Send to server every minute - wait for confirmation before showing tokens
    if (currentMinute > lastRecordedMinuteRef.current && !pendingMinute) {
      lastRecordedMinuteRef.current = currentMinute;
      setPendingMinute(true);
      
      // Report exactly 60 seconds per minute watched
      if (onWatch) {
        onWatch(videoId, 60, isSponsored).then((result) => {
          setPendingMinute(false);
          if (result && result.tokensEarned > 0) {
            // Only show tokens AFTER server confirms
            setSessionTokens(prev => prev + result.tokensEarned);
          }
        }).catch(() => {
          setPendingMinute(false);
        });
      } else {
        setPendingMinute(false);
      }
    }
  }, [videoId, onWatch, isSponsored, pendingMinute]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 mb-4 ${isSponsored ? 'ring-2 ring-yellow-500/50' : ''}`}>
      {isSponsored && (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-3 py-1 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span>SPONSORED</span>
          </div>
          <span>{SPONSORED_VIDEO_EARN_TEXT}</span>
        </div>
      )}
      <YouTubePlayer 
        videoId={videoId} 
        onTimeUpdate={handleTimeUpdate}
        isSponsored={isSponsored}
      />
      <CardContent className="p-3">
        {title && (
          <p className="text-white text-sm font-medium mb-2 line-clamp-2">{title}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>{formatTime(watchTime)}</span>
          </div>
          {pendingMinute ? (
            <Badge className="bg-gray-600 text-gray-300 animate-pulse">
              Saving...
            </Badge>
          ) : sessionTokens > 0 ? (
            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
              +{sessionTokens} $VIDEO
            </Badge>
          ) : watchTime > 0 && watchTime < 60 ? (
            <span className="text-xs text-gray-500">
              {60 - watchTime}s until first token
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

// Video Card Skeleton for loading state
function VideoCardSkeleton() {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 mb-4">
      {/* Video thumbnail skeleton */}
      <div className="relative w-full aspect-video bg-gray-800">
        <Skeleton className="absolute inset-0 bg-gray-700" />
        {/* Play button overlay skeleton */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gray-600/50 flex items-center justify-center">
            <Skeleton className="w-8 h-8 rounded-full bg-gray-500" />
          </div>
        </div>
      </div>
      <CardContent className="p-3 space-y-3">
        {/* Title skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-gray-700" />
          <Skeleton className="h-4 w-3/4 bg-gray-700" />
        </div>
        {/* Footer skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full bg-gray-700" />
            <Skeleton className="h-3 w-12 bg-gray-700" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full bg-gray-700" />
        </div>
      </CardContent>
    </Card>
  );
}

// Welcome Screen
function WelcomeScreen({ onConnect, language, onLanguageChange }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const { isInstalled, isChecking } = useMiniKit();

  const txt = translations[language]?.welcome || translations['en'].welcome;
  const errorTxt = translations[language]?.error || translations['en'].error;

  // Pre-detect country while user is viewing the welcome screen
  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Skip auto-detection if user has already manually selected a language
        const savedLanguage = localStorage.getItem('vidlook_language');
        if (savedLanguage) {
          console.log('Language already saved, skipping auto-detection:', savedLanguage);
          return;
        }
        
        const res = await fetch('https://api.country.is');
        const data = await res.json();
        if (data.country) {
          setDetectedCountry(data.country);
          console.log('Pre-detected country:', data.country);
          
          // Auto-set language based on country (only if no saved preference)
          const detectedLang = getLanguageFromCountry(data.country);
          if (detectedLang !== 'en') {
            onLanguageChange(detectedLang);
          }
        }
      } catch (e) {
        console.log('Country pre-detection failed');
      }
    };
    detectCountry();
  }, []);

  const handleConnect = async () => {
    if (!MiniKit.isInstalled()) {
      console.error('MiniKit is not installed');
      return;
    }

    setIsConnecting(true);
    
    try {
      // Use MiniKit wallet auth
      const { commandPayload, finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: crypto.randomUUID().replace(/-/g, ''),
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement: 'Sign in to VidLook to watch videos and earn $VIDEO tokens',
      });

      if (finalPayload.status === 'error') {
        console.error('Wallet auth failed:', finalPayload);
        setIsConnecting(false);
        return;
      }

      // Get wallet address from MiniKit user
      const walletAddress = MiniKit.user?.walletAddress;
      const username = MiniKit.user?.username;
      
      if (walletAddress) {
        // Pass to parent with username if available
        onConnect(walletAddress, detectedCountry, username);
      }
    } catch (error) {
      console.error('Wallet auth error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  // Show loading while checking MiniKit
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
      </div>
    );
  }

  // Show error if not inside World App
  if (!isInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 text-center">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 blur-3xl opacity-30 rounded-full" />
              <img 
                src={LOGO_URL} 
                alt="VidLook" 
                className="w-24 h-24 relative z-10 drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {errorTxt.title}
            </h1>
            <p className="text-gray-400">
              {errorTxt.message}
            </p>
          </div>

          {/* Download Link */}
          <div className="pt-6 space-y-3">
            <p className="text-gray-500 text-sm">{errorTxt.downloadTitle}</p>
            <Button
              onClick={() => window.open('https://world.org/download', '_blank')}
              className="w-full h-12 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {errorTxt.downloadButton}
            </Button>
          </div>

          {/* Language Selector */}
          <div className="relative pt-4">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition text-gray-300"
            >
              <Globe className="w-4 h-4" />
              <span className="text-lg">{currentLang.flag}</span>
              <span>{currentLang.name}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showLanguageDropdown && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-xl z-50">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setShowLanguageDropdown(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-700 transition ${
                      language === lang.code ? 'bg-gray-700' : ''
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-white">{lang.name}</span>
                    {language === lang.code && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 blur-3xl opacity-30 rounded-full" />
            <img 
              src={LOGO_URL} 
              alt="VidLook" 
              className="w-24 h-24 relative z-10 drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white tracking-tight">
            Vid<span className="text-red-500">Look</span>
          </h1>
          <p className="text-xl text-gray-400 font-medium">
            {txt.tagline}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 py-3">
          <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-4 backdrop-blur">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">{txt.feature1Title}</p>
              <p className="text-gray-400 text-sm">{txt.feature1Desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-4 backdrop-blur">
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
              <Coins className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">{txt.feature2Title}</p>
              <p className="text-gray-400 text-sm">{txt.feature2Desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-4 backdrop-blur">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">{txt.feature3Title}</p>
              <p className="text-gray-400 text-sm">{txt.feature3Desc}</p>
            </div>
          </div>
        </div>

        {/* Connect Button */}
        <Button 
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-2xl shadow-lg shadow-red-500/25 transition-all transform hover:scale-[1.02]"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {txt.connecting}
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5 mr-2" />
              {txt.connectWallet}
            </>
          )}
        </Button>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition text-gray-300"
          >
            <Globe className="w-4 h-4" />
            <span className="text-lg">{currentLang.flag}</span>
            <span>{currentLang.name}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showLanguageDropdown && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-xl z-50">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setShowLanguageDropdown(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-700 transition ${
                    language === lang.code ? 'bg-gray-700' : ''
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-white">{lang.name}</span>
                  {language === lang.code && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Home Screen (Video Feed)
function HomeScreen({ user, onTokensEarned, language }) {
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef(null);
  const loadingRef = useRef(false); // Prevent concurrent loads
  const loadVideosRef = useRef(null); // Always points to latest loadVideos

  const txt = translations[language]?.home || translations['en'].home;

  const loadVideos = async (pageNum = 1, retryCount = 0) => {
    // Prevent concurrent/duplicate loads
    if (loadingRef.current) return;
    loadingRef.current = true;
    
    try {
      if (pageNum === 1) setIsLoading(true);
      else setLoadingMore(true);
      
      const res = await fetch(`/api/videos/feed?region=${user?.country || 'US'}&page=${pageNum}&limit=10`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      
      // Check if we got valid data
      if (!data.videos || data.videos.length === 0) {
        setHasMore(false); // No more videos — stop trying
        if (pageNum === 1) {
          toast.error('No videos available. Pull down to refresh.', { duration: 3000 });
        }
        return;
      }
      
      if (pageNum === 1) {
        setVideos(data.videos);
      } else {
        setVideos(prev => [...prev, ...data.videos]);
      }
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load videos:', error);
      
      // Retry up to 2 times with exponential backoff
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s
        console.log(`Retrying in ${delay}ms... (attempt ${retryCount + 2})`);
        loadingRef.current = false; // Allow retry
        setTimeout(() => loadVideos(pageNum, retryCount + 1), delay);
        return;
      }
      
      // Show error only on first page load failure after retries
      if (pageNum === 1) {
        toast.error('Failed to load videos. Check your connection.', { duration: 4000 });
      }
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  };

  // Keep ref in sync so observer always calls latest loadVideos
  loadVideosRef.current = loadVideos;

  // Load initial videos
  useEffect(() => {
    loadVideos();
  }, [user?.country]);

  // Infinite scroll using callback ref — attaches observer when sentinel mounts
  const loadMoreCallbackRef = useCallback((node) => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!node) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current) {
          // Read current page/hasMore via functional state updates
          setPage(currentPage => {
            setHasMore(currentHasMore => {
              if (currentHasMore) {
                // Use ref to call the latest loadVideos (not a stale closure)
                loadVideosRef.current(currentPage + 1);
              }
              return currentHasMore;
            });
            return currentPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(node);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/videos/search?q=${encodeURIComponent(searchQuery)}&region=${user?.country || 'US'}`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      
      // Handle API-level errors
      if (data.error === 'search_failed') {
        toast.error(data.message || 'Search temporarily unavailable', { duration: 4000 });
        setSearchResults([]);
        return;
      }
      
      // Handle empty results
      if (!data.items || data.items.length === 0) {
        toast.info('No videos found for your search', { duration: 3000 });
        setSearchResults([]);
        return;
      }
      
      setSearchResults(data.items);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed. Please try again.', { duration: 3000 });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleWatch = useCallback(async (videoId, watchedSeconds, isSponsored) => {
    try {
      const res = await fetch('/api/watch/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          videoId,
          watchedSeconds,
          isSponsored // Server calculates tokens based on this
        })
      });
      const data = await res.json();
      
      // Update total tokens in UI
      if (data.totalTokens !== undefined && onTokensEarned) {
        onTokensEarned(data.totalTokens);
      }
      
      // Show message to user if there's one (rate limits, daily limits, etc.)
      if (data.message && data.tokensEarned === 0) {
        // Only show non-success messages
        if (data.message !== 'Keep watching to earn tokens!') {
          toast.info(data.message, { duration: 3000 });
        }
      }
      
      return { tokensEarned: data.tokensEarned || 0, message: data.message };
    } catch (error) {
      console.error('Failed to record watch:', error);
      return { tokensEarned: 0, message: 'Connection error' };
    }
  }, [user?.id, onTokensEarned]);

  const displayVideos = searchResults.length > 0 ? searchResults : videos;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-lg border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <img src={LOGO_URL} alt="VidLook" className="w-8 h-8" />
          <h1 className="text-xl font-bold text-white">VidLook</h1>
          <Badge className="ml-auto bg-gradient-to-r from-red-500 to-orange-500 text-white">
            {user?.totalTokens?.toLocaleString() || 0} $VIDEO
          </Badge>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={txt.searchPlaceholder}
              className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-xl"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={isSearching}
            className="bg-red-500 hover:bg-red-600 rounded-xl"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </form>
      </div>

      {/* Search Results Header */}
      {searchResults.length > 0 && (
        <div className="px-4 py-3 bg-gray-900/50 flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            {txt.resultsFor.replace('{count}', searchResults.length).replace('{query}', searchQuery)}
          </p>
          <Button variant="ghost" size="sm" onClick={clearSearch} className="text-red-500">
            {txt.clear}
          </Button>
        </div>
      )}

      {/* Trending Header */}
      {searchResults.length === 0 && !isSearching && (
        <div className="px-4 py-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-red-500" />
          <h2 className="text-white font-bold">
            {isLoading ? (
              <Skeleton className="h-5 w-40 bg-gray-700 inline-block" />
            ) : (
              txt.trendingIn.replace('{country}', COUNTRY_NAMES[user?.country] || user?.country || txt.yourRegion)
            )}
          </h2>
        </div>
      )}

      {/* Video Feed */}
      <div className="px-4 py-4 space-y-4">
        {isLoading && videos.length === 0 ? (
          // Skeleton UI for initial loading state
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        ) : isSearching ? (
          // Skeleton UI for search loading state
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <VideoCardSkeleton key={`search-skeleton-${i}`} />
            ))}
          </div>
        ) : (
          <>
            {searchResults.length > 0 ? (
              // Search Results with Adsterra ads
              searchResults
                .filter(video => video.id?.videoId)
                .map((video, index) => (
                  <React.Fragment key={video.id.videoId}>
                    <VideoCard 
                      videoId={video.id.videoId}
                      title={video.snippet?.title}
                      onWatch={handleWatch}
                    />
                    {/* Banner 468x60 below search first video */}
                    {index === 0 && (
                      <AdsterraBanner 
                        adKey={ADSTERRA_ADS.searchFirstVideo.key}
                        width={ADSTERRA_ADS.searchFirstVideo.width}
                        height={ADSTERRA_ADS.searchFirstVideo.height}
                      />
                    )}
                    {/* Show search ads after every 3 videos (total 2 ads) */}
                    {index > 0 && (index + 1) % 3 === 0 && Math.floor((index + 1) / 3) <= ADSTERRA_ADS.searchAds.length && (
                      <AdsterraBanner 
                        adKey={ADSTERRA_ADS.searchAds[Math.floor((index + 1) / 3) - 1].key}
                        width={ADSTERRA_ADS.searchAds[Math.floor((index + 1) / 3) - 1].width}
                        height={ADSTERRA_ADS.searchAds[Math.floor((index + 1) / 3) - 1].height}
                      />
                    )}
                  </React.Fragment>
                ))
            ) : (
              // Feed Videos (Trending + Sponsored) with Adsterra ads
              displayVideos
                .filter(video => video.videoId)
                .map((video, index) => (
                  <React.Fragment key={video.videoId + '-' + index}>
                    <VideoCard 
                      videoId={video.videoId}
                      title={video.title}
                      isSponsored={video.isSponsored || false}
                      onWatch={handleWatch}
                    />
                    {/* Native banner below sponsored video (first video) */}
                    {index === 0 && video.isSponsored && (
                      <AdsterraNativeBanner />
                    )}
                    {/* Show feed ads after every 3 videos (total 3 ads) */}
                    {(index + 1) % 3 === 0 && Math.floor((index + 1) / 3) <= ADSTERRA_ADS.feedAds.length && (
                      <AdsterraBanner 
                        adKey={ADSTERRA_ADS.feedAds[Math.floor((index + 1) / 3) - 1].key}
                        width={ADSTERRA_ADS.feedAds[Math.floor((index + 1) / 3) - 1].width}
                        height={ADSTERRA_ADS.feedAds[Math.floor((index + 1) / 3) - 1].height}
                      />
                    )}
                  </React.Fragment>
                ))
            )}

            {/* Load More Trigger — uses callback ref so observer attaches when sentinel appears */}
            {hasMore && searchResults.length === 0 && (
              <div ref={loadMoreCallbackRef} className="flex items-center justify-center py-8">
                {loadingMore && <Loader2 className="w-6 h-6 text-red-500 animate-spin" />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Profile Screen
function ProfileScreen({ user, onTokensEarned, onLogout, language }) {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before rendering (fixes iOS loading issue)
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [completingTask, setCompletingTask] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const txt = translations[language]?.profile || translations['en'].profile;
  const taskTxt = translations[language]?.tasks || translations['en'].tasks;

  // Map task IDs to translation keys
  const getTaskName = (taskId, fallbackName) => {
    const taskMap = {
      'daily_login': taskTxt.dailyLogin,
      'follow_x': taskTxt.followX,
      'post_x': taskTxt.postX,
      'watch_1hour': taskTxt.watch1Hour
    };
    return taskMap[taskId] || fallbackName;
  };

  useEffect(() => {
    if (user?.id) {
      loadProfileData();
    }
  }, [user?.id]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, tasksRes, historyRes] = await Promise.all([
        fetch(`/api/stats/${user.id}`),
        fetch(`/api/tasks/${user.id}`),
        fetch(`/api/history/${user.id}`)
      ]);

      const [statsData, tasksData, historyData] = await Promise.all([
        statsRes.json(),
        tasksRes.json(),
        historyRes.json()
      ]);

      setStats(statsData);
      setTasks(tasksData);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeTask = async (taskId) => {
    setCompletingTask(taskId);
    try {
      // For follow_x task: open Twitter profile first, then complete
      if (taskId === 'follow_x') {
        window.open('https://x.com/vidlookapp', '_blank');
      }
      
      // For post_x task: open Twitter with pre-filled tweet
      if (taskId === 'post_x') {
        const tweetText = encodeURIComponent('I\'m earning $VIDEO tokens by watching YouTube videos on @vidlookapp! 🎬💰\n\nWatch & Earn in the World App! 🌍\n\n#VidLook #WorldApp #Web3 #Crypto');
        window.open(`https://x.com/intent/tweet?text=${tweetText}`, '_blank');
      }
      
      const res = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, taskId })
      });
      const data = await res.json();
      
      if (data.error) {
        // Show error message for specific cases
        console.log('Task error:', data.error);
        return;
      }
      
      if (data.success) {
        // Update tasks
        setTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
        ));
        if (onTokensEarned) {
          onTokensEarned(data.totalTokens);
        }
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    } finally {
      setCompletingTask(null);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(user?.walletAddress || '');
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  if (!isMounted || isLoading) {
    return (
      <div className="pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
        {/* Profile Header Skeleton */}
        <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full bg-gray-700" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32 bg-gray-700" />
              <Skeleton className="h-4 w-24 bg-gray-700" />
            </div>
            <Skeleton className="h-10 w-24 rounded-lg bg-gray-700" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-black/30 border-gray-700">
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-3 w-20 bg-gray-700" />
                  <Skeleton className="h-7 w-16 bg-gray-700" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tasks Skeleton */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-5 h-5 rounded-full bg-gray-700" />
            <Skeleton className="h-5 w-32 bg-gray-700" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg bg-gray-700" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40 bg-gray-700" />
                      <Skeleton className="h-3 w-20 bg-gray-700" />
                    </div>
                    <Skeleton className="h-8 w-16 rounded-lg bg-gray-700" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Skeleton */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-5 h-5 rounded-full bg-gray-700" />
            <Skeleton className="h-5 w-16 bg-gray-700" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-full bg-gray-700" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity Skeleton */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-5 h-5 rounded-full bg-gray-700" />
            <Skeleton className="h-5 w-28 bg-gray-700" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-gray-900 border-gray-800">
                <CardContent className="p-3 flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24 bg-gray-700" />
                    <Skeleton className="h-3 w-32 bg-gray-700" />
                  </div>
                  <Skeleton className="h-5 w-12 rounded-full bg-gray-700" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 p-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white">
            <User className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white truncate">@{user?.username}</h2>
            <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
              <span className="truncate">{user?.walletAddress?.slice(0, 6)}...{user?.walletAddress?.slice(-4)}</span>
              <button onClick={copyAddress} className="flex-shrink-0">
                <Copy className="w-4 h-4 hover:text-white transition" />
              </button>
            </div>
          </div>
          <Button 
            onClick={onLogout}
            variant="outline"
            className="flex-shrink-0 bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 px-3 py-2 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>{txt.logout}</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Card className="bg-black/30 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Coins className="w-4 h-4" />
                <span className="text-xs">{txt.videoBalance}</span>
              </div>
              <p className="text-2xl font-bold text-white">{user?.totalTokens?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-black/30 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">{txt.watchTime}</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatTime(stats?.totalWatchTimeSeconds || 0)}</p>
            </CardContent>
          </Card>
          <Card className="bg-black/30 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">{txt.totalEarned}</span>
              </div>
              <p className="text-2xl font-bold text-green-500">{stats?.totalTokensEarned?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-black/30 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">{txt.joined}</span>
              </div>
              <p className="text-sm font-bold text-white">
                {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'Today'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tasks */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-white">{txt.tasksRewards}</h3>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id} className={`bg-gray-900 border-gray-800 ${task.completed ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{task.icon}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium">{getTaskName(task.id, task.name)}</p>
                    <p className="text-sm text-gray-400">+{task.reward} $VIDEO</p>
                  </div>
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => completeTask(task.id)}
                      disabled={completingTask === task.id}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {completingTask === task.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        txt.claim
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-white">{txt.faq}</h3>
        </div>

        <div className="space-y-3">
          {/* FAQ 1 */}
          <Card className="bg-gray-900 border-gray-800 overflow-hidden">
            <button 
              onClick={() => setExpandedFaq(expandedFaq === 1 ? null : 1)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <p className="text-white font-medium">{txt.faq1Question}</p>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedFaq === 1 ? 'rotate-180' : ''}`} />
            </button>
            {expandedFaq === 1 && (
              <div className="px-4 pb-4">
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {txt.faq1Answer} <a href="https://help.vidlook.app/" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">https://help.vidlook.app/</a>
                </p>
              </div>
            )}
          </Card>

          {/* FAQ 2 */}
          <Card className="bg-gray-900 border-gray-800 overflow-hidden">
            <button 
              onClick={() => setExpandedFaq(expandedFaq === 2 ? null : 2)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <p className="text-white font-medium">{txt.faq2Question}</p>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedFaq === 2 ? 'rotate-180' : ''}`} />
            </button>
            {expandedFaq === 2 && (
              <div className="px-4 pb-4">
                <p className="text-gray-400 text-sm">
                  {txt.faq2Answer}
                </p>
              </div>
            )}
          </Card>

          {/* FAQ 3 */}
          <Card className="bg-gray-900 border-gray-800 overflow-hidden">
            <button 
              onClick={() => setExpandedFaq(expandedFaq === 3 ? null : 3)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <p className="text-white font-medium">{txt.faq3Question}</p>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedFaq === 3 ? 'rotate-180' : ''}`} />
            </button>
            {expandedFaq === 3 && (
              <div className="px-4 pb-4">
                <p className="text-gray-400 text-sm whitespace-pre-line">
                  {txt.faq3Answer}
                </p>
              </div>
            )}
          </Card>

          {/* FAQ 4 - Transparency */}
          <Card className="bg-gray-900 border-gray-800 overflow-hidden">
            <button 
              onClick={() => setExpandedFaq(expandedFaq === 4 ? null : 4)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <p className="text-white font-medium">{txt.faq4Question}</p>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedFaq === 4 ? 'rotate-180' : ''}`} />
            </button>
            {expandedFaq === 4 && (
              <div className="px-4 pb-4">
                <p className="text-gray-400 text-sm whitespace-pre-line">
                  {txt.faq4Answer}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Watch History */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-white">{txt.recentActivity}</h3>
        </div>

        {history.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <Play className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">{txt.noHistory}</p>
              <p className="text-gray-500 text-sm">{txt.startWatching}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 5).map((item, index) => (
              <Card key={item.id || index} className="bg-gray-900 border-gray-800">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <Play className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium truncate">Video watched</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(item.timestamp).toLocaleDateString()} • {formatTime(item.watchedSeconds)}
                    </p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-500">
                    +{item.tokensEarned}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Convert Screen
function ConvertScreen({ user, onTokensUpdate, language }) {
  const [amount, setAmount] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [conversions, setConversions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmationWld, setConfirmationWld] = useState(null);

  const txt = translations[language]?.convert || translations['en'].convert;

  useEffect(() => {
    if (user?.id) {
      loadConversions();
    }
  }, [user?.id]);

  const loadConversions = async () => {
    try {
      const res = await fetch(`/api/conversions/${user.id}`);
      const data = await res.json();
      setConversions(data);
    } catch (error) {
      console.error('Failed to load conversions:', error);
    }
  };

  const handleConvert = async () => {
    const videoTokens = parseInt(amount);
    
    setError('');
    setSuccess('');
    
    if (!videoTokens || videoTokens < 5000) {
      setError('Minimum conversion is 5000 $VIDEO tokens');
      return;
    }
    
    if (videoTokens > (user?.totalTokens || 0)) {
      setError('Insufficient $VIDEO tokens');
      return;
    }

    // COMING SOON - Conversion temporarily disabled until April 2026
    setSuccess(txt.comingSoon);
    return;

    /* Original conversion logic - disabled for now
    setIsConverting(true);
    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, videoTokens })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(`Successfully converted ${videoTokens} $VIDEO to ${data.wldAmount} WLD!`);
        setConfirmationWld(data.wldAmount);
        setAmount('');
        if (onTokensUpdate) {
          onTokensUpdate(data.remainingTokens);
        }
        loadConversions();
        
        // Clear confirmation after 1 minute
        setTimeout(() => {
          setConfirmationWld(null);
          setSuccess('');
        }, 60000);
      }
    } catch (error) {
      setError('Conversion failed. Please try again.');
    } finally {
      setIsConverting(false);
    }
    */
  };

  const wldAmount = amount ? Math.floor(parseInt(amount) / 1000) : 0;
  const isValid = parseInt(amount) >= 5000 && parseInt(amount) <= (user?.totalTokens || 0);

  const presetAmounts = [5000, 10000, 25000, 50000];

  return (
    <div className="pb-24 p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
          <ArrowRightLeft className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{txt.title}</h1>
          <p className="text-gray-400 text-sm">{txt.rate}</p>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30 mb-6">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400 text-sm mb-1">{txt.availableBalance}</p>
          <p className="text-4xl font-bold text-white">{user?.totalTokens?.toLocaleString() || 0}</p>
          <p className="text-red-500 font-medium">{txt.videoTokens}</p>
        </CardContent>
      </Card>

      {/* Conversion Form */}
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">{txt.amountToConvert}</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={txt.enterAmount}
              className="bg-gray-800 border-gray-700 text-white text-lg h-14"
            />
          </div>

          {/* Preset Amounts */}
          <div className="flex flex-wrap gap-2">
            {presetAmounts.map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                onClick={() => setAmount(preset.toString())}
                disabled={preset > (user?.totalTokens || 0)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                {preset.toLocaleString()}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount((user?.totalTokens || 0).toString())}
              className="border-red-500 text-red-500 hover:bg-red-500/10"
            >
              {txt.max}
            </Button>
          </div>

          <Separator className="bg-gray-800" />

          {/* Conversion Preview */}
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-400">{txt.youWillReceive}</span>
            <span className="text-2xl font-bold text-green-500">{wldAmount} WLD</span>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-500 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-500 text-sm text-center">
              <p className="font-medium">{success}</p>
              {confirmationWld && (
                <p className="mt-1 text-xs">{txt.confirmationMsg.replace('{amount}', confirmationWld)}</p>
              )}
            </div>
          )}

          <Button
            onClick={handleConvert}
            disabled={!isValid || isConverting}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {txt.converting}
              </>
            ) : (
              txt.convertButton
            )}
          </Button>

          <p className="text-center text-gray-500 text-xs">
            {txt.minimum}
          </p>
          <p className="text-center text-gray-500 text-xs">
            {txt.conversionsStartDate}
          </p>
        </CardContent>
      </Card>

      {/* Conversion History */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-red-500" />
          {txt.history}
        </h3>

        {conversions.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <ArrowRightLeft className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">{txt.noConversions}</p>
              <p className="text-gray-500 text-sm">{txt.convertFirst}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversions.map((conv, index) => (
              <Card key={conv.id || index} className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{conv.videoTokens?.toLocaleString()} $VIDEO</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(conv.timestamp).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-500 font-bold">{conv.wldAmount} WLD</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Bottom Navigation
function BottomNav({ activeTab, onTabChange, language }) {
  const txt = translations[language]?.nav || translations['en'].nav;
  
  const tabs = [
    { id: 'home', icon: Home, label: txt.home },
    { id: 'convert', icon: ArrowRightLeft, label: txt.convert },
    { id: 'profile', icon: User, label: txt.profile }
  ];

  const handleTabChange = (tabId) => {
    window.scrollTo(0, 0);
    onTabChange(tabId);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-gray-800 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around max-w-md mx-auto px-6 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all ${
                isActive 
                  ? 'bg-red-500/20 text-red-500' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [language, setLanguage] = useState('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Handle language change with localStorage persistence
  const handleLanguageChange = useCallback((newLang) => {
    setLanguage(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vidlook_language', newLang);
    }
  }, []);

  // Check for existing session on app load - uses localStorage for persistence
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        // Load saved language preference first (before any auto-detection)
        const savedLanguage = localStorage.getItem('vidlook_language');
        if (savedLanguage && ['en', 'es', 'th', 'ja'].includes(savedLanguage)) {
          setLanguage(savedLanguage);
        }
        
        // Check localStorage for saved wallet address
        const savedWalletAddress = localStorage.getItem('vidlook_wallet_address');
        
        if (savedWalletAddress) {
          // Try to get existing user from API
          const res = await fetch(`/api/users/${savedWalletAddress}`);
          if (res.ok) {
            const userData = await res.json();
            if (userData && userData.id) {
              setUser(userData);
              // Only set language based on country if user hasn't manually selected one
              if (!savedLanguage) {
                const userLang = getLanguageFromCountry(userData.country);
                if (userLang !== 'en') setLanguage(userLang);
              }
              setIsLoading(false);
              setIsInitialized(true);
              return;
            }
          }
          // If user not found in DB, clear the saved address
          localStorage.removeItem('vidlook_wallet_address');
        }
      } catch (e) {
        console.log('Session restore failed:', e);
      }
      setIsLoading(false);
      setIsInitialized(true);
    };
    
    checkExistingSession();
  }, []);

  const handleConnect = async (walletAddress, preDetectedCountry, username) => {
    setIsLoading(true);
    try {
      // Use pre-detected country or detect now
      let country = preDetectedCountry || 'US';
      if (!preDetectedCountry) {
        try {
          const countryRes = await fetch('https://api.country.is');
          const countryData = await countryRes.json();
          country = countryData.country || 'US';
        } catch (e) {
          console.log('Country detection failed, using default');
        }
      }

      // Connect wallet - use MiniKit username if available
      const res = await fetch('/api/users/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          username: username || `User_${walletAddress.slice(2, 8)}`,
          country
        })
      });

      const userData = await res.json();
      
      // Save wallet address to localStorage for session persistence
      if (userData && userData.id) {
        localStorage.setItem('vidlook_wallet_address', walletAddress);
      }
      
      setUser(userData);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokensUpdate = (newTotal) => {
    setUser(prev => prev ? { ...prev, totalTokens: newTotal } : null);
  };

  // Show loading screen while checking for existing session
  if (isLoading && !isInitialized) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <img src={LOGO_URL} alt="VidLook" className="w-20 h-20 mb-4" />
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  // Not connected - show welcome
  if (!user) {
    return (
      <WelcomeScreen 
        onConnect={handleConnect} 
        language={language}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {activeTab === 'home' && (
        <HomeScreen 
          user={user} 
          onTokensEarned={handleTokensUpdate}
          language={language}
        />
      )}
      
      {activeTab === 'convert' && (
        <ConvertScreen 
          user={user}
          onTokensUpdate={handleTokensUpdate}
          language={language}
        />
      )}
      
      {activeTab === 'profile' && (
        <ProfileScreen 
          user={user}
          onTokensEarned={handleTokensUpdate}
          onLogout={() => {
            localStorage.removeItem('vidlook_wallet_address');
            setUser(null);
          }}
          language={language}
        />
      )}

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        language={language}
      />
    </div>
  );
}

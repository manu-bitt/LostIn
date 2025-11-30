export function extractVideoId(url) {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '');
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    const v = parsed.searchParams.get('v');
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

    const shortsMatch = parsed.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];

  } catch (e) {
    return null;
  }

  return null;
}

export function extractPlaylistId(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    const parsed = new URL(url.trim());
    const list = parsed.searchParams.get('list');
    if (list && list.length > 0) return list;
  } catch (e) {
    return null;
  }

  return null;
}

export function buildEmbedUrl(url) {
  const playlistId = extractPlaylistId(url);
  if (playlistId) {
    return `https://www.youtube.com/embed/videoseries?list=${playlistId}&modestbranding=1&rel=0&playsinline=1`;
  }

  const videoId = extractVideoId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&playsinline=1`;
  }

  return null;
}

export function isValidYouTubeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return extractVideoId(url) !== null || extractPlaylistId(url) !== null;
}


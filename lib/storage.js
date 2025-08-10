// Storage utilities for tracks and playlists
const STORAGE_KEYS = {
  TRACKS: 'mp3_player_tracks',
  PLAYLISTS: 'mp3_player_playlists',
  RECENTLY_PLAYED: 'mp3_player_recently_played',
  SETTINGS: 'mp3_player_settings'
};

// Track storage functions
export const getTracks = () => {
  if (typeof window === 'undefined') return [];
  try {
    const tracks = localStorage.getItem(STORAGE_KEYS.TRACKS);
    return tracks ? JSON.parse(tracks) : [];
  } catch (error) {
    console.error('Error loading tracks:', error);
    return [];
  }
};

export const saveTracks = (tracks) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(tracks));
  } catch (error) {
    console.error('Error saving tracks:', error);
  }
};

export const addTrack = (track) => {
  const tracks = getTracks();
  const newTrack = {
    id: Date.now().toString(),
    title: track.title || 'Unknown Title',
    artist: track.artist || 'Unknown Artist',
    album: track.album || 'Unknown Album',
    duration: track.duration || 0,
    src: track.src,
    artwork: track.artwork || null,
    addedAt: new Date().toISOString(),
    ...track
  };
  
  const updatedTracks = [...tracks, newTrack];
  saveTracks(updatedTracks);
  return newTrack;
};

export const removeTrack = (trackId) => {
  const tracks = getTracks();
  const updatedTracks = tracks.filter(track => track.id !== trackId);
  saveTracks(updatedTracks);
  
  // Remove from playlists
  const playlists = getPlaylists();
  const updatedPlaylists = playlists.map(playlist => ({
    ...playlist,
    tracks: playlist.tracks.filter(id => id !== trackId)
  }));
  savePlaylists(updatedPlaylists);
};

export const getTrackById = (trackId) => {
  const tracks = getTracks();
  return tracks.find(track => track.id === trackId);
};

// Playlist storage functions
export const getPlaylists = () => {
  if (typeof window === 'undefined') return [];
  try {
    const playlists = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
    return playlists ? JSON.parse(playlists) : [];
  } catch (error) {
    console.error('Error loading playlists:', error);
    return [];
  }
};

export const savePlaylists = (playlists) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  } catch (error) {
    console.error('Error saving playlists:', error);
  }
};

export const createPlaylist = (name, description = '') => {
  const playlists = getPlaylists();
  const newPlaylist = {
    id: Date.now().toString(),
    name,
    description,
    tracks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const updatedPlaylists = [...playlists, newPlaylist];
  savePlaylists(updatedPlaylists);
  return newPlaylist;
};

export const deletePlaylist = (playlistId) => {
  const playlists = getPlaylists();
  const updatedPlaylists = playlists.filter(playlist => playlist.id !== playlistId);
  savePlaylists(updatedPlaylists);
};

export const addTrackToPlaylist = (playlistId, trackId) => {
  const playlists = getPlaylists();
  const updatedPlaylists = playlists.map(playlist => {
    if (playlist.id === playlistId && !playlist.tracks.includes(trackId)) {
      return {
        ...playlist,
        tracks: [...playlist.tracks, trackId],
        updatedAt: new Date().toISOString()
      };
    }
    return playlist;
  });
  savePlaylists(updatedPlaylists);
};

export const removeTrackFromPlaylist = (playlistId, trackId) => {
  const playlists = getPlaylists();
  const updatedPlaylists = playlists.map(playlist => {
    if (playlist.id === playlistId) {
      return {
        ...playlist,
        tracks: playlist.tracks.filter(id => id !== trackId),
        updatedAt: new Date().toISOString()
      };
    }
    return playlist;
  });
  savePlaylists(updatedPlaylists);
};

export const getPlaylistById = (playlistId) => {
  const playlists = getPlaylists();
  return playlists.find(playlist => playlist.id === playlistId);
};

export const getPlaylistTracks = (playlistId) => {
  const playlist = getPlaylistById(playlistId);
  if (!playlist) return [];
  
  const tracks = getTracks();
  return playlist.tracks.map(trackId => 
    tracks.find(track => track.id === trackId)
  ).filter(Boolean);
};

// Recently played functions
export const getRecentlyPlayed = () => {
  if (typeof window === 'undefined') return [];
  try {
    const recent = localStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED);
    return recent ? JSON.parse(recent) : [];
  } catch (error) {
    console.error('Error loading recently played:', error);
    return [];
  }
};

export const addToRecentlyPlayed = (trackId) => {
  if (typeof window === 'undefined') return;
  
  const recent = getRecentlyPlayed();
  const filtered = recent.filter(item => item.trackId !== trackId);
  const updated = [{
    trackId,
    playedAt: new Date().toISOString()
  }, ...filtered].slice(0, 50); // Keep only last 50 tracks
  
  try {
    localStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recently played:', error);
  }
};

export const getRecentlyPlayedTracks = () => {
  const recent = getRecentlyPlayed();
  const tracks = getTracks();
  
  return recent.map(item => {
    const track = tracks.find(t => t.id === item.trackId);
    return track ? { ...track, playedAt: item.playedAt } : null;
  }).filter(Boolean);
};

// Settings functions
export const getSettings = () => {
  if (typeof window === 'undefined') return {};
  try {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : {
      volume: 1,
      shuffle: false,
      repeat: 'none', // 'none', 'one', 'all'
      theme: 'light'
    };
  } catch (error) {
    console.error('Error loading settings:', error);
    return {};
  }
};

export const saveSettings = (settings) => {
  if (typeof window === 'undefined') return;
  try {
    const currentSettings = getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

// Utility functions
export const clearAllData = () => {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

export const exportData = () => {
  return {
    tracks: getTracks(),
    playlists: getPlaylists(),
    recentlyPlayed: getRecentlyPlayed(),
    settings: getSettings(),
    exportedAt: new Date().toISOString()
  };
};

export const importData = (data) => {
  if (data.tracks) saveTracks(data.tracks);
  if (data.playlists) savePlaylists(data.playlists);
  if (data.settings) saveSettings(data.settings);
};
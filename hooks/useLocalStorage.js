import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

// Specialized hook for tracks
export function useTracks() {
  const [tracks, setTracks] = useLocalStorage('mp3-player-tracks', []);

  const addTrack = (track) => {
    const newTrack = {
      id: Date.now().toString(),
      name: track.name || 'Unknown',
      artist: track.artist || 'Unknown Artist',
      album: track.album || 'Unknown Album',
      duration: track.duration || 0,
      url: track.url,
      file: track.file,
      addedAt: new Date().toISOString(),
      ...track
    };
    setTracks(prev => [...prev, newTrack]);
    return newTrack;
  };

  const removeTrack = (trackId) => {
    setTracks(prev => prev.filter(track => track.id !== trackId));
  };

  const updateTrack = (trackId, updates) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, ...updates } : track
    ));
  };

  const getTrack = (trackId) => {
    return tracks.find(track => track.id === trackId);
  };

  return {
    tracks,
    addTrack,
    removeTrack,
    updateTrack,
    getTrack,
    setTracks
  };
}

// Specialized hook for playlists
export function usePlaylists() {
  const [playlists, setPlaylists] = useLocalStorage('mp3-player-playlists', []);

  const addPlaylist = (name, description = '') => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      description,
      tracks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    return newPlaylist;
  };

  const removePlaylist = (playlistId) => {
    setPlaylists(prev => prev.filter(playlist => playlist.id !== playlistId));
  };

  const updatePlaylist = (playlistId, updates) => {
    setPlaylists(prev => prev.map(playlist => 
      playlist.id === playlistId 
        ? { ...playlist, ...updates, updatedAt: new Date().toISOString() }
        : playlist
    ));
  };

  const addTrackToPlaylist = (playlistId, trackId) => {
    setPlaylists(prev => prev.map(playlist => 
      playlist.id === playlistId && !playlist.tracks.includes(trackId)
        ? { 
            ...playlist, 
            tracks: [...playlist.tracks, trackId],
            updatedAt: new Date().toISOString()
          }
        : playlist
    ));
  };

  const removeTrackFromPlaylist = (playlistId, trackId) => {
    setPlaylists(prev => prev.map(playlist => 
      playlist.id === playlistId
        ? { 
            ...playlist, 
            tracks: playlist.tracks.filter(id => id !== trackId),
            updatedAt: new Date().toISOString()
          }
        : playlist
    ));
  };

  const getPlaylist = (playlistId) => {
    return playlists.find(playlist => playlist.id === playlistId);
  };

  return {
    playlists,
    addPlaylist,
    removePlaylist,
    updatePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    getPlaylist,
    setPlaylists
  };
}

// Hook for recently played tracks
export function useRecentlyPlayed() {
  const [recentlyPlayed, setRecentlyPlayed] = useLocalStorage('mp3-player-recent', []);

  const addToRecent = (trackId) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(item => item.trackId !== trackId);
      const newItem = {
        trackId,
        playedAt: new Date().toISOString()
      };
      return [newItem, ...filtered].slice(0, 20); // Keep only last 20
    });
  };

  const clearRecent = () => {
    setRecentlyPlayed([]);
  };

  return {
    recentlyPlayed,
    addToRecent,
    clearRecent
  };
}
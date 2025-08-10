'use client';

import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';

const AudioContext = createContext();

const initialState = {
  currentTrack: null,
  isPlaying: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  queue: [],
  currentIndex: -1,
  isShuffled: false,
  repeatMode: 'none', // 'none', 'one', 'all'
  recentlyPlayed: [],
  isExpanded: false,
  error: null
};

const audioReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TRACK':
      return {
        ...state,
        currentTrack: action.payload,
        isLoading: true,
        error: null
      };

    case 'SET_PLAYING':
      return {
        ...state,
        isPlaying: action.payload,
        isLoading: false
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_TIME':
      return {
        ...state,
        currentTime: action.payload
      };

    case 'SET_DURATION':
      return {
        ...state,
        duration: action.payload
      };

    case 'SET_VOLUME':
      return {
        ...state,
        volume: action.payload,
        isMuted: action.payload === 0
      };

    case 'TOGGLE_MUTE':
      return {
        ...state,
        isMuted: !state.isMuted
      };

    case 'SET_QUEUE':
      return {
        ...state,
        queue: action.payload,
        currentIndex: action.index || 0
      };

    case 'SET_CURRENT_INDEX':
      return {
        ...state,
        currentIndex: action.payload
      };

    case 'TOGGLE_SHUFFLE':
      return {
        ...state,
        isShuffled: !state.isShuffled
      };

    case 'SET_REPEAT_MODE':
      const modes = ['none', 'one', 'all'];
      const currentModeIndex = modes.indexOf(state.repeatMode);
      const nextMode = modes[(currentModeIndex + 1) % modes.length];
      return {
        ...state,
        repeatMode: nextMode
      };

    case 'ADD_TO_RECENTLY_PLAYED':
      const filtered = state.recentlyPlayed.filter(track => track.id !== action.payload.id);
      return {
        ...state,
        recentlyPlayed: [action.payload, ...filtered].slice(0, 20)
      };

    case 'TOGGLE_EXPANDED':
      return {
        ...state,
        isExpanded: !state.isExpanded
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

export const AudioProvider = ({ children }) => {
  const [state, dispatch] = useReducer(audioReducer, initialState);
  const audioRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      
      const audio = audioRef.current;

      const handleLoadStart = () => dispatch({ type: 'SET_LOADING', payload: true });
      const handleCanPlay = () => dispatch({ type: 'SET_LOADING', payload: false });
      const handlePlay = () => dispatch({ type: 'SET_PLAYING', payload: true });
      const handlePause = () => dispatch({ type: 'SET_PLAYING', payload: false });
      const handleTimeUpdate = () => dispatch({ type: 'SET_TIME', payload: audio.currentTime });
      const handleLoadedMetadata = () => dispatch({ type: 'SET_DURATION', payload: audio.duration });
      const handleEnded = () => handleNext();
      const handleError = () => dispatch({ type: 'SET_ERROR', payload: 'Failed to load audio' });

      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      };
    }
  }, []);

  const playTrack = (track, queue = null, index = 0) => {
    if (!audioRef.current) return;

    dispatch({ type: 'SET_TRACK', payload: track });
    
    if (queue) {
      dispatch({ type: 'SET_QUEUE', payload: queue, index });
    }

    audioRef.current.src = track.url;
    audioRef.current.load();
    audioRef.current.play().catch(error => {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to play audio' });
    });

    dispatch({ type: 'ADD_TO_RECENTLY_PLAYED', payload: track });
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !state.currentTrack) return;

    if (state.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to play audio' });
      });
    }
  };

  const handleNext = () => {
    if (state.queue.length === 0) return;

    let nextIndex = state.currentIndex + 1;

    if (state.repeatMode === 'one') {
      nextIndex = state.currentIndex;
    } else if (nextIndex >= state.queue.length) {
      if (state.repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return;
      }
    }

    if (state.isShuffled && state.repeatMode !== 'one') {
      nextIndex = Math.floor(Math.random() * state.queue.length);
    }

    const nextTrack = state.queue[nextIndex];
    if (nextTrack) {
      dispatch({ type: 'SET_CURRENT_INDEX', payload: nextIndex });
      playTrack(nextTrack);
    }
  };

  const handlePrevious = () => {
    if (state.queue.length === 0) return;

    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    let prevIndex = state.currentIndex - 1;

    if (prevIndex < 0) {
      if (state.repeatMode === 'all') {
        prevIndex = state.queue.length - 1;
      } else {
        return;
      }
    }

    const prevTrack = state.queue[prevIndex];
    if (prevTrack) {
      dispatch({ type: 'SET_CURRENT_INDEX', payload: prevIndex });
      playTrack(prevTrack);
    }
  };

  const seekTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const setVolume = (volume) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      dispatch({ type: 'SET_VOLUME', payload: volume });
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !state.isMuted;
      audioRef.current.muted = newMutedState;
      dispatch({ type: 'TOGGLE_MUTE' });
    }
  };

  const value = {
    ...state,
    playTrack,
    togglePlayPause,
    handleNext,
    handlePrevious,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle: () => dispatch({ type: 'TOGGLE_SHUFFLE' }),
    toggleRepeat: () => dispatch({ type: 'SET_REPEAT_MODE' }),
    toggleExpanded: () => dispatch({ type: 'TOGGLE_EXPANDED' }),
    clearError: () => dispatch({ type: 'CLEAR_ERROR' })
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
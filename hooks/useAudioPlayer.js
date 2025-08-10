import { useState, useRef, useEffect, useCallback } from 'react';

export const useAudioPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off'); // 'off', 'one', 'all'

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => handleNext();
    const handleError = (e) => {
      setError('Failed to load audio');
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Update audio source when track changes
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.volume = volume;
    }
  }, [currentTrack, volume]);

  const play = useCallback(async () => {
    if (!audioRef.current || !currentTrack) return;

    try {
      setError(null);
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      setError('Failed to play audio');
      setIsPlaying(false);
    }
  }, [currentTrack]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time) => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const changeVolume = useCallback((newVolume) => {
    if (!audioRef.current) return;
    
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    audioRef.current.volume = clampedVolume;
    setVolume(clampedVolume);
  }, []);

  const loadTrack = useCallback((track, trackQueue = [], index = 0) => {
    setCurrentTrack(track);
    setQueue(trackQueue);
    setCurrentIndex(index);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
  }, []);

  const handleNext = useCallback(() => {
    if (queue.length === 0) return;

    let nextIndex;
    
    if (repeat === 'one') {
      nextIndex = currentIndex;
    } else if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === 'all') {
          nextIndex = 0;
        } else {
          return;
        }
      }
    }

    setCurrentIndex(nextIndex);
    setCurrentTrack(queue[nextIndex]);
  }, [queue, currentIndex, shuffle, repeat]);

  const handlePrevious = useCallback(() => {
    if (queue.length === 0) return;

    if (currentTime > 3) {
      seek(0);
      return;
    }

    let prevIndex;
    
    if (shuffle) {
      prevIndex = Math.floor(Math.random() * queue.length);
    } else {
      prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        if (repeat === 'all') {
          prevIndex = queue.length - 1;
        } else {
          prevIndex = 0;
        }
      }
    }

    setCurrentIndex(prevIndex);
    setCurrentTrack(queue[prevIndex]);
  }, [queue, currentIndex, currentTime, shuffle, repeat, seek]);

  const toggleShuffle = useCallback(() => {
    setShuffle(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeat(prev => {
      switch (prev) {
        case 'off': return 'all';
        case 'all': return 'one';
        case 'one': return 'off';
        default: return 'off';
      }
    });
  }, []);

  const formatTime = useCallback((time) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    volume,
    isLoading,
    error,
    queue,
    currentIndex,
    shuffle,
    repeat,
    
    // Actions
    play,
    pause,
    togglePlay,
    seek,
    changeVolume,
    loadTrack,
    next: handleNext,
    previous: handlePrevious,
    toggleShuffle,
    toggleRepeat,
    
    // Utils
    formatTime,
    progress: duration > 0 ? (currentTime / duration) * 100 : 0,
    hasNext: queue.length > 0 && (currentIndex < queue.length - 1 || repeat === 'all' || shuffle),
    hasPrevious: queue.length > 0 && (currentIndex > 0 || repeat === 'all' || shuffle),
  };
};
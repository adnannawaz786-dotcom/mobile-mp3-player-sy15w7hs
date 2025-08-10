import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Heart, MoreHorizontal, Repeat, Shuffle } from 'lucide-react';
import { useAudio } from '../lib/audioContext';

const FullScreenPlayer = ({ isOpen, onClose }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isRepeat,
    isShuffle,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleRepeat,
    toggleShuffle,
    toggleFavorite
  } = useAudio();

  const [isDragging, setIsDragging] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const progressRef = useRef(null);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    seekTo(newTime);
  };

  const handleProgressDrag = (e) => {
    if (!isDragging || !progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    seekTo(newTime);
  };

  useEffect(() => {
    const handleMouseMove = (e) => handleProgressDrag(e);
    const handleMouseUp = () => setIsDragging(false);
    const handleTouchMove = (e) => {
      e.preventDefault();
      handleProgressDrag(e);
    };
    const handleTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  if (!currentTrack) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 z-50 flex flex-col"
          style={{
            background: `linear-gradient(180deg, 
              ${currentTrack.dominantColor || '#7c3aed'} 0%, 
              ${currentTrack.dominantColor || '#7c3aed'}80 50%, 
              #1f2937 100%)`
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-12">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="text-center">
              <p className="text-white/80 text-sm">Playing from</p>
              <p className="text-white font-medium">{currentTrack.album || 'Library'}</p>
            </div>
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <MoreHorizontal className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Album Art */}
          <div className="flex-1 flex items-center justify-center px-8 py-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative w-full max-w-sm aspect-square"
            >
              <img
                src={currentTrack.artwork || '/default-album.jpg'}
                alt={currentTrack.title}
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent" />
            </motion.div>
          </div>

          {/* Track Info */}
          <div className="px-8 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-white text-2xl font-bold truncate mb-1">
                  {currentTrack.title}
                </h1>
                <p className="text-white/70 text-lg truncate">
                  {currentTrack.artist}
                </p>
              </div>
              <button
                onClick={() => toggleFavorite(currentTrack.id)}
                className="p-2 ml-4"
              >
                <Heart
                  className={`w-6 h-6 ${
                    currentTrack.isFavorite
                      ? 'text-red-500 fill-current'
                      : 'text-white/70'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-8 pb-6">
            <div
              ref={progressRef}
              className="relative h-1 bg-white/20 rounded-full cursor-pointer mb-2"
              onClick={handleProgressClick}
            >
              <div
                className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing"
                style={{ left: `${progress}%`, transform: 'translateX(-50%) translateY(-50%)' }}
                onMouseDown={() => setIsDragging(true)}
                onTouchStart={() => setIsDragging(true)}
              />
            </div>
            <div className="flex justify-between text-white/70 text-sm">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="px-8 pb-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition-colors ${
                  isShuffle ? 'text-purple-300' : 'text-white/70'
                }`}
              >
                <Shuffle className="w-5 h-5" />
              </button>
              <button
                onClick={previousTrack}
                className="p-2 text-white hover:text-purple-300 transition-colors"
              >
                <SkipBack className="w-8 h-8" />
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-gray-900" />
                ) : (
                  <Play className="w-8 h-8 text-gray-900 ml-1" />
                )}
              </motion.button>
              <button
                onClick={nextTrack}
                className="p-2 text-white hover:text-purple-300 transition-colors"
              >
                <SkipForward className="w-8 h-8" />
              </button>
              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-full transition-colors ${
                  isRepeat ? 'text-purple-300' : 'text-white/70'
                }`}
              >
                <Repeat className="w-5 h-5" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center justify-center">
              <button
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <Volume2 className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {showVolumeSlider && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 120, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="ml-3 relative"
                  >
                    <div className="h-1 bg-white/20 rounded-full">
                      <div
                        className="h-full bg-white rounded-full"
                        style={{ width: `${volume * 100}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume * 100}
                      onChange={(e) => setVolume(e.target.value / 100)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenPlayer;
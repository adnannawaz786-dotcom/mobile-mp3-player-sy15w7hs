import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, ChevronUp } from 'lucide-react';
import { useAudio } from '../lib/audioContext';

export default function MiniPlayer({ onExpand }) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    previousTrack,
    nextTrack,
    seek,
    setVolume
  } = useAudio();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    seek(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40"
      >
        {/* Progress Bar */}
        <div 
          className="w-full h-1 bg-gray-200 cursor-pointer"
          onClick={handleProgressClick}
        >
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Mini Player Content */}
        <div className="flex items-center justify-between p-3">
          {/* Track Info & Album Art */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <motion.div
              whileTap={{ scale: 0.95 }}
              onClick={onExpand}
              className="cursor-pointer"
            >
              <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                {currentTrack.artwork ? (
                  <img
                    src={currentTrack.artwork}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />
                )}
              </div>
            </motion.div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-gray-500 truncate">
                {currentTrack.artist}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-400">
                  {formatTime(currentTime)}
                </span>
                <span className="text-xs text-gray-300">/</span>
                <span className="text-xs text-gray-400">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* Volume Control */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Volume2 size={18} />
              </motion.button>

              <AnimatePresence>
                {showVolumeSlider && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3"
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Previous Track */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={previousTrack}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <SkipBack size={18} />
            </motion.button>

            {/* Play/Pause */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={isPlaying ? pause : play}
              className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </motion.button>

            {/* Next Track */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={nextTrack}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <SkipForward size={18} />
            </motion.button>

            {/* Expand Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onExpand}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors ml-2"
            >
              <ChevronUp size={18} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
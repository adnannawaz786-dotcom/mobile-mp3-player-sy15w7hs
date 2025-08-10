import React from 'react';
import { Play, Pause, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAudio } from '../lib/audioContext';

const TrackItem = ({ 
  track, 
  index, 
  showIndex = false, 
  showArtwork = true,
  onMoreOptions,
  className = '' 
}) => {
  const { 
    currentTrack, 
    isPlaying, 
    playTrack, 
    pauseTrack,
    addToRecentlyPlayed 
  } = useAudio();

  const isCurrentTrack = currentTrack?.id === track.id;

  const handlePlayPause = () => {
    if (isCurrentTrack) {
      if (isPlaying) {
        pauseTrack();
      } else {
        playTrack(track);
      }
    } else {
      playTrack(track);
      addToRecentlyPlayed(track);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={`flex items-center gap-3 p-3 hover:bg-gray-50 active:bg-gray-100 transition-colors ${className}`}
    >
      {showIndex && (
        <div className="w-6 text-sm text-gray-500 text-center">
          {isCurrentTrack && isPlaying ? (
            <div className="flex justify-center">
              <div className="flex space-x-0.5">
                <motion.div
                  className="w-0.5 h-3 bg-blue-500"
                  animate={{ height: [8, 12, 8] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
                <motion.div
                  className="w-0.5 h-3 bg-blue-500"
                  animate={{ height: [12, 8, 12] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-0.5 h-3 bg-blue-500"
                  animate={{ height: [8, 12, 8] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          ) : (
            <span>{index + 1}</span>
          )}
        </div>
      )}

      {showArtwork && (
        <div className="relative">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
            onClick={handlePlayPause}
          >
            {track.artwork ? (
              <img
                src={track.artwork}
                alt={track.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
              </div>
            )}
            
            <motion.div
              className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              whileHover={{ opacity: 1 }}
            >
              {isCurrentTrack && isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </motion.div>
          </motion.div>
        </div>
      )}

      <div className="flex-1 min-w-0 cursor-pointer" onClick={handlePlayPause}>
        <h3 className={`font-medium text-sm truncate ${
          isCurrentTrack ? 'text-blue-600' : 'text-gray-900'
        }`}>
          {track.title}
        </h3>
        <p className="text-xs text-gray-500 truncate">
          {track.artist}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">
          {formatDuration(track.duration)}
        </span>
        
        {onMoreOptions && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onMoreOptions(track);
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default TrackItem;
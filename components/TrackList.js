import React from 'react';
import { Play, Pause, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../lib/audioContext';

const TrackList = ({ tracks = [], showAlbumArt = true, showDuration = true, className = '' }) => {
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useAudio();

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = (track) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        pauseTrack();
      } else {
        playTrack(track);
      }
    } else {
      playTrack(track);
    }
  };

  const isCurrentTrack = (track) => currentTrack?.id === track.id;

  if (!tracks || tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Play className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-500 text-sm">No tracks available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <AnimatePresence>
        {tracks.map((track, index) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
              isCurrentTrack(track)
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            {/* Album Art & Play Button */}
            <div className="relative flex-shrink-0 mr-3">
              {showAlbumArt && (
                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                  {track.albumArt ? (
                    <img
                      src={track.albumArt}
                      alt={track.album || 'Album art'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              )}
              
              {/* Play/Pause Overlay */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handlePlayPause(track)}
                className={`absolute inset-0 flex items-center justify-center rounded-lg transition-opacity duration-200 ${
                  isCurrentTrack(track) || showAlbumArt
                    ? 'bg-black bg-opacity-50 opacity-0 hover:opacity-100'
                    : 'bg-blue-500 text-white opacity-100'
                }`}
              >
                {isCurrentTrack(track) && isPlaying ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white" />
                )}
              </motion.button>
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-sm truncate ${
                isCurrentTrack(track) ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {track.title || 'Unknown Title'}
              </h3>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {track.artist || 'Unknown Artist'}
                {track.album && ` • ${track.album}`}
              </p>
              
              {/* Now Playing Indicator */}
              {isCurrentTrack(track) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center mt-1"
                >
                  <div className="flex space-x-0.5 mr-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-0.5 bg-blue-500 rounded-full"
                        animate={{
                          height: isPlaying ? [2, 8, 2] : 2,
                        }}
                        transition={{
                          duration: 1,
                          repeat: isPlaying ? Infinity : 0,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-blue-600 font-medium">
                    {isPlaying ? 'Now Playing' : 'Paused'}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Duration & Actions */}
            <div className="flex items-center space-x-2 ml-2">
              {showDuration && (
                <span className="text-xs text-gray-400 font-mono">
                  {formatDuration(track.duration)}
                </span>
              )}
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TrackList;
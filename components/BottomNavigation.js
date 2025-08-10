import React from 'react';
import { useRouter } from 'next/router';
import { Home, Music, List, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../lib/audioContext';

const BottomNavigation = () => {
  const router = useRouter();
  const { 
    currentTrack, 
    isPlaying, 
    togglePlayPause, 
    nextTrack, 
    previousTrack,
    showMiniPlayer,
    expandPlayer 
  } = useAudio();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'library', label: 'Library', icon: Music, path: '/library' },
    { id: 'playlists', label: 'Playlists', icon: List, path: '/playlists' }
  ];

  const handleNavClick = (path) => {
    router.push(path);
  };

  const handleAlbumArtClick = () => {
    expandPlayer();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      {/* Mini Player */}
      <AnimatePresence>
        {showMiniPlayer && currentTrack && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="px-4 py-2 bg-gray-50 border-b border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAlbumArtClick}
                  className="flex-shrink-0"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                </motion.button>
                
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {currentTrack.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {currentTrack.artist}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={previousTrack}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <SkipBack className="w-4 h-4 text-gray-600" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlayPause}
                  className="p-2 rounded-full bg-gray-900 hover:bg-gray-800 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white ml-0.5" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextTrack}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <SkipForward className="w-4 h-4 text-gray-600" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      <div className="flex items-center justify-around py-2 px-4 bg-white">
        {navItems.map((item) => {
          const isActive = router.pathname === item.path;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavClick(item.path)}
              className="flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-colors relative"
            >
              <motion.div
                animate={{
                  color: isActive ? '#6366f1' : '#6b7280'
                }}
                transition={{ duration: 0.2 }}
              >
                <Icon className="w-6 h-6 mb-1" />
              </motion.div>
              
              <motion.span
                animate={{
                  color: isActive ? '#6366f1' : '#6b7280'
                }}
                transition={{ duration: 0.2 }}
                className="text-xs font-medium"
              >
                {item.label}
              </motion.span>

              {/* Active indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="absolute -top-1 w-1 h-1 bg-indigo-500 rounded-full"
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Safe area padding for mobile devices */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </div>
  );
};

export default BottomNavigation;
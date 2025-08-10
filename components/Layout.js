import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Music, List, Play, Pause, SkipBack, SkipForward, Volume2, ChevronUp, ChevronDown } from 'lucide-react';
import { useAudio } from '../lib/audioContext';

const Layout = ({ children, currentPage }) => {
  const { 
    currentTrack, 
    isPlaying, 
    play, 
    pause, 
    nextTrack, 
    previousTrack,
    currentTime,
    duration 
  } = useAudio();
  
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  const navigationItems = [
    { id: 'home', icon: Home, label: 'Home', href: '/' },
    { id: 'library', icon: Music, label: 'Library', href: '/library' },
    { id: 'playlists', icon: List, label: 'Playlists', href: '/playlists' }
  ];

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const MiniPlayer = () => (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="bg-white border-t border-gray-200 px-4 py-2"
    >
      <div className="flex items-center space-x-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsPlayerExpanded(true)}
          className="flex-shrink-0"
        >
          <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden">
            {currentTrack?.artwork ? (
              <img 
                src={currentTrack.artwork} 
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        </motion.button>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {currentTrack?.title || 'No track selected'}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {currentTrack?.artist || 'Unknown artist'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={previousTrack}
            className="p-1"
          >
            <SkipBack className="w-5 h-5 text-gray-600" />
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={togglePlayPause}
            className="p-2 bg-gray-900 rounded-full"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" />
            )}
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={nextTrack}
            className="p-1"
          >
            <SkipForward className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>
      </div>
      
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </motion.div>
  );

  const ExpandedPlayer = () => (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 bg-gradient-to-b from-blue-50 to-white z-50 flex flex-col"
    >
      <div className="flex-1 flex flex-col px-6 pt-12 pb-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsPlayerExpanded(false)}
          className="self-center mb-4 p-2"
        >
          <ChevronDown className="w-6 h-6 text-gray-600" />
        </motion.button>
        
        <div className="flex-1 flex flex-col justify-center items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-72 h-72 bg-gray-200 rounded-2xl overflow-hidden shadow-2xl mb-8"
          >
            {currentTrack?.artwork ? (
              <img 
                src={currentTrack.artwork} 
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <Music className="w-20 h-20 text-white" />
              </div>
            )}
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {currentTrack?.title || 'No track selected'}
            </h1>
            <p className="text-lg text-gray-600">
              {currentTrack?.artist || 'Unknown artist'}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full mb-6"
          >
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center space-x-8"
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={previousTrack}
              className="p-3"
            >
              <SkipBack className="w-8 h-8 text-gray-700" />
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={togglePlayPause}
              className="p-4 bg-gray-900 rounded-full shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={nextTrack}
              className="p-3"
            >
              <SkipForward className="w-8 h-8 text-gray-700" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 pb-20">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <motion.a
                key={item.id}
                href={item.href}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-blue-600' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </motion.a>
            );
          })}
        </div>
      </nav>
      
      <AnimatePresence>
        {currentTrack && !isPlayerExpanded && (
          <div className="fixed bottom-16 left-0 right-0 z-30">
            <MiniPlayer />
          </div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isPlayerExpanded && <ExpandedPlayer />}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Search, Music, Check } from 'lucide-react';
import { useAudio } from '../lib/audioContext';
import { createPlaylist, addTrackToPlaylist, getPlaylists } from '../lib/storage';

const PlaylistModal = ({ isOpen, onClose, mode = 'create', playlistId = null }) => {
  const { tracks } = useAudio();
  const [playlistName, setPlaylistName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTracks, setSelectedTracks] = useState(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState('name'); // 'name' or 'tracks'

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) {
      setPlaylistName('');
      setSearchQuery('');
      setSelectedTracks(new Set());
      setCurrentStep('name');
    }
  }, [isOpen]);

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) return;
    
    setIsCreating(true);
    try {
      const newPlaylist = await createPlaylist(playlistName.trim());
      
      // Add selected tracks to playlist
      for (const trackId of selectedTracks) {
        await addTrackToPlaylist(newPlaylist.id, trackId);
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddToPlaylist = async () => {
    if (selectedTracks.size === 0) return;
    
    setIsCreating(true);
    try {
      for (const trackId of selectedTracks) {
        await addTrackToPlaylist(playlistId, trackId);
      }
      onClose();
    } catch (error) {
      console.error('Error adding tracks to playlist:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleTrackSelection = (trackId) => {
    const newSelected = new Set(selectedTracks);
    if (newSelected.has(trackId)) {
      newSelected.delete(trackId);
    } else {
      newSelected.add(trackId);
    }
    setSelectedTracks(newSelected);
  };

  const handleNext = () => {
    if (mode === 'create' && currentStep === 'name' && playlistName.trim()) {
      setCurrentStep('tracks');
    }
  };

  const handleBack = () => {
    if (currentStep === 'tracks') {
      setCurrentStep('name');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white w-full sm:w-[480px] sm:max-w-[90vw] max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {currentStep === 'tracks' && mode === 'create' && (
                <button
                  onClick={handleBack}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="rotate-45" />
                </button>
              )}
              <h2 className="text-lg font-semibold text-gray-900">
                {mode === 'create' 
                  ? currentStep === 'name' 
                    ? 'New Playlist' 
                    : 'Add Songs'
                  : 'Add to Playlist'
                }
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {(mode === 'add' || currentStep === 'tracks') ? (
              // Track Selection View
              <div className="h-full flex flex-col">
                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search songs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {selectedTracks.size > 0 && (
                    <div className="mt-3 text-sm text-gray-600">
                      {selectedTracks.size} song{selectedTracks.size !== 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>

                {/* Track List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredTracks.length > 0 ? (
                    <div className="p-2">
                      {filteredTracks.map((track) => {
                        const isSelected = selectedTracks.has(track.id);
                        return (
                          <motion.div
                            key={track.id}
                            whileHover={{ scale: 0.995 }}
                            whileTap={{ scale: 0.99 }}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => toggleTrackSelection(track.id)}
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              {track.artwork ? (
                                <img src={track.artwork} alt={track.title} className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                <Music size={20} className="text-white" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">{track.title}</h3>
                              <p className="text-sm text-gray-500 truncate">{track.artist}</p>
                            </div>

                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isSelected 
                                ? 'bg-blue-500 border-blue-500' 
                                : 'border-gray-300'
                            }`}>
                              {isSelected && <Check size={14} className="text-white" />}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                      <Music size={32} className="mb-2" />
                      <p>No songs found</p>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="p-4 border-t border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={mode === 'create' ? handleCreatePlaylist : handleAddToPlaylist}
                    disabled={isCreating || (mode === 'create' && selectedTracks.size === 0)}
                    className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                  >
                    {isCreating ? 'Creating...' : mode === 'create' ? 'Create Playlist' : 'Add Songs'}
                  </motion.button>
                </div>
              </div>
            ) : (
              // Playlist Name Input View
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    placeholder="Enter playlist name..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    disabled={!playlistName.trim()}
                    className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                  >
                    Next
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlaylistModal;
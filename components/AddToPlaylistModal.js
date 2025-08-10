import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Music } from 'lucide-react';
import { useAudio } from '../lib/audioContext';
import { getPlaylists, addTrackToPlaylist, createPlaylist } from '../lib/storage';

const AddToPlaylistModal = ({ isOpen, onClose, track }) => {
  const [playlists, setPlaylists] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadPlaylists();
    }
  }, [isOpen]);

  const loadPlaylists = () => {
    const storedPlaylists = getPlaylists();
    setPlaylists(storedPlaylists);
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    setIsCreating(true);
    try {
      const newPlaylist = createPlaylist(newPlaylistName.trim());
      if (track) {
        addTrackToPlaylist(newPlaylist.id, track);
      }
      setPlaylists([...playlists, newPlaylist]);
      setNewPlaylistName('');
      setShowCreateForm(false);
      onClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    if (!track) return;

    setAddingToPlaylist(playlistId);
    try {
      addTrackToPlaylist(playlistId, track);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error adding to playlist:', error);
    } finally {
      setAddingToPlaylist(null);
    }
  };

  const handleClose = () => {
    setShowCreateForm(false);
    setNewPlaylistName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md mx-4 max-h-[80vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Add to Playlist
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Track Info */}
          {track && (
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {track.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {track.artist || 'Unknown Artist'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto max-h-96">
            {showCreateForm ? (
              <div className="p-6">
                <form onSubmit={handleCreatePlaylist} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Playlist Name
                    </label>
                    <input
                      type="text"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      placeholder="Enter playlist name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      autoFocus
                      disabled={isCreating}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      disabled={isCreating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newPlaylistName.trim() || isCreating}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isCreating ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-4">
                {/* Create New Playlist Button */}
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors mb-4"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-gray-900 font-medium">Create New Playlist</span>
                </button>

                {/* Existing Playlists */}
                <div className="space-y-2">
                  {playlists.length === 0 ? (
                    <div className="text-center py-8">
                      <Music className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No playlists yet</p>
                      <p className="text-sm text-gray-400">Create your first playlist above</p>
                    </div>
                  ) : (
                    playlists.map((playlist) => (
                      <motion.button
                        key={playlist.id}
                        onClick={() => handleAddToPlaylist(playlist.id)}
                        disabled={addingToPlaylist === playlist.id}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <Music className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-gray-900 font-medium">{playlist.name}</p>
                          <p className="text-sm text-gray-500">
                            {playlist.tracks?.length || 0} tracks
                          </p>
                        </div>
                        {addingToPlaylist === playlist.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"
                          />
                        )}
                      </motion.button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddToPlaylistModal;
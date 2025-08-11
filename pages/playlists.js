import { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Music, MoreVertical, Play, Trash2, Edit } from 'lucide-react';
import Layout from '../components/Layout';
import { AudioContext } from '../lib/audioContext';
import { 
  getPlaylists, 
  createPlaylist, 
  deletePlaylist, 
  updatePlaylist, 
  getPlaylistTracks 
} from '../lib/storage';

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const { playTrack, currentTrack } = useContext(AudioContext);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = () => {
    const savedPlaylists = getPlaylists();
    setPlaylists(savedPlaylists);
  };

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      const newPlaylist = createPlaylist(newPlaylistName.trim());
      setPlaylists(prev => [...prev, newPlaylist]);
      setNewPlaylistName('');
      setShowCreateModal(false);
    }
  };

  const handleDeletePlaylist = (playlistId) => {
    deletePlaylist(playlistId);
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
  };

  const handleEditPlaylist = (playlist) => {
    setEditingPlaylist(playlist);
    setNewPlaylistName(playlist.name);
    setShowCreateModal(true);
  };

  const handleUpdatePlaylist = (e) => {
    e.preventDefault();
    if (newPlaylistName.trim() && editingPlaylist) {
      updatePlaylist({ id: editingPlaylist.id, name: newPlaylistName.trim() });
      setPlaylists(prev => prev.map(p => 
        p.id === editingPlaylist.id 
          ? { ...p, name: newPlaylistName.trim() }
          : p
      ));
      setNewPlaylistName('');
      setShowCreateModal(false);
      setEditingPlaylist(null);
    }
  };

  const handlePlayPlaylist = (playlist) => {
    const tracks = getPlaylistTracks(playlist.id);
    if (tracks.length > 0) {
      playTrack(tracks[0]);
    }
  };

  const PlaylistCard = ({ playlist }) => {
    const tracks = getPlaylistTracks(playlist.id);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{playlist.name}</h3>
              <p className="text-sm text-gray-500">{tracks.length} tracks</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {tracks.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePlayPlaylist(playlist)}
                className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
              >
                <Play className="w-4 h-4" />
              </motion.button>
            )}
            
            <div className="relative group">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
              
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[120px]">
                <button
                  onClick={() => handleEditPlaylist(playlist)}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeletePlaylist(playlist.id)}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-400">
          Created {new Date(playlist.createdAt).toLocaleDateString()}
        </div>
      </motion.div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pb-32">
        <div className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-2xl font-bold text-gray-900">Playlists</h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors shadow-lg"
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <AnimatePresence>
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </AnimatePresence>

          {playlists.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No playlists yet</h3>
              <p className="text-gray-400 mb-6">Create your first playlist to get started</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Create Playlist
              </motion.button>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-md"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {editingPlaylist ? 'Edit Playlist' : 'Create New Playlist'}
                </h2>
                
                <form onSubmit={editingPlaylist ? handleUpdatePlaylist : handleCreatePlaylist}>
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Enter playlist name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none mb-4"
                    autoFocus
                  />
                  
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingPlaylist(null);
                        setNewPlaylistName('');
                      }}
                      className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      {editingPlaylist ? 'Update' : 'Create'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

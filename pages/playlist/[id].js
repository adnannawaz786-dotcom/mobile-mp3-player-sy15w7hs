import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Checkbox } from '../../components/ui/checkbox';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, MoreVertical, Plus, Music } from 'lucide-react';
import { useAudio } from '../../lib/audioContext';
import { getPlaylist, updatePlaylist, getAllTracks } from '../../lib/storage';

export default function PlaylistPage() {
  const router = useRouter();
  const { id } = router.query;
  const { currentTrack, playTrack, isPlaying } = useAudio();
  
  const [playlist, setPlaylist] = useState(null);
  const [allTracks, setAllTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPlaylist();
      loadAllTracks();
    }
  }, [id]);

  const loadPlaylist = () => {
    const playlistData = getPlaylist(id);
    if (!playlistData) {
      router.push('/playlists');
      return;
    }
    setPlaylist(playlistData);
    setLoading(false);
  };

  const loadAllTracks = () => {
    const tracks = getAllTracks();
    setAllTracks(tracks);
  };

  const handlePlayTrack = (track) => {
    playTrack(track);
  };

  const handleAddTracks = () => {
    if (selectedTracks.length === 0) return;
    
    const tracksToAdd = allTracks.filter(track => 
      selectedTracks.includes(track.id) && 
      !playlist.tracks.some(pTrack => pTrack.id === track.id)
    );
    
    const updatedPlaylist = {
      ...playlist,
      tracks: [...playlist.tracks, ...tracksToAdd]
    };
    
    updatePlaylist(updatedPlaylist);
    setPlaylist(updatedPlaylist);
    setSelectedTracks([]);
    setShowAddDialog(false);
  };

  const toggleTrackSelection = (trackId) => {
    setSelectedTracks(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!playlist) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Playlist not found</p>
        </div>
      </Layout>
    );
  }

  const availableTracks = allTracks.filter(track => 
    !playlist.tracks.some(pTrack => pTrack.id === track.id)
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Playlist Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{playlist.name}</h1>
            <p className="text-gray-500 mt-1">
              {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
            </p>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Tracks to Playlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {availableTracks.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        No tracks available to add
                      </p>
                    ) : (
                      availableTracks.map((track) => (
                        <div
                          key={track.id}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                        >
                          <Checkbox
                            id={track.id}
                            checked={selectedTracks.includes(track.id)}
                            onCheckedChange={() => toggleTrackSelection(track.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{track.title}</p>
                            <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddTracks}
                    disabled={selectedTracks.length === 0}
                  >
                    Add {selectedTracks.length} tracks
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Tracks List */}
        <Card>
          <CardContent className="p-0">
            {playlist.tracks.length === 0 ? (
              <div className="text-center py-12">
                <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No tracks in this playlist</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tracks
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                <AnimatePresence>
                  {playlist.tracks.map((track, index) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center p-4 hover:bg-gray-50 transition-colors ${
                        currentTrack?.id === track.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handlePlayTrack(track)}
                        className="mr-3 flex-shrink-0"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${
                          currentTrack?.id === track.id ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {track.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{track.artist}</p>
                      </div>
                      
                      <div className="text-sm text-gray-500 mr-3">
                        {formatDuration(track.duration)}
                      </div>
                      
                      <Button size="icon" variant="ghost">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
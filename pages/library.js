import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Music, Upload, Search, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import { AudioContext } from '../lib/audioContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

export default function Library() {
  const { tracks, currentTrack, playTrack, isPlaying } = useContext(AudioContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [showUpload, setShowUpload] = useState(false);

  const filteredTracks = tracks
    .filter(track => 
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
      if (sortBy === 'duration') return a.duration - b.duration;
      return 0;
    });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        // Refresh tracks list
        window.location.reload();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className="flex flex-col h-full bg-gradient-to-b from-purple-50 to-white">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-purple-100 z-10">
          <div className="flex items-center justify-between p-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Library</h1>
              <p className="text-sm text-gray-500">{tracks.length} songs</p>
            </div>
            
            <Button
              onClick={() => setShowUpload(!showUpload)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-10 h-10 p-0"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Upload Section */}
          <AnimatePresence>
            {showUpload && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0">
                  <Card className="border-dashed border-2 border-purple-200 bg-purple-50/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <Upload className="w-8 h-8 text-purple-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-3">
                          Upload MP3 files to your library
                        </p>
                        <input
                          type="file"
                          accept="audio/mp3,audio/mpeg"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="audio-upload"
                        />
                        <label
                          htmlFor="audio-upload"
                          className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Choose Files
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search and Filter */}
          <div className="p-4 pt-0 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search songs, artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-purple-200 focus:border-purple-400"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'recently-added', 'favorites'].map((filter) => (
                <Button
                  key={filter}
                  variant={filterBy === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterBy(filter)}
                  className={`whitespace-nowrap ${
                    filterBy === filter 
                      ? 'bg-purple-600 text-white' 
                      : 'border-purple-200 text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Tracks List */}
        <div className="flex-1 overflow-y-auto">
          {filteredTracks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-64 text-center p-8"
            >
              <Music className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                {searchQuery ? 'No songs found' : 'Your library is empty'}
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                {searchQuery 
                  ? 'Try searching with different keywords'
                  : 'Upload some music to get started'
                }
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowUpload(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Music
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      currentTrack?.id === track.id 
                        ? 'bg-purple-50 border-purple-200 shadow-sm' 
                        : 'bg-white border-gray-100 hover:border-purple-200'
                    }`}
                    onClick={() => playTrack(track)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center ${
                            currentTrack?.id === track.id && isPlaying ? 'animate-pulse' : ''
                          }`}>
                            <Music className="w-6 h-6 text-white" />
                          </div>
                          {currentTrack?.id === track.id && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                              <div className={`w-2 h-2 bg-white rounded-full ${isPlaying ? 'animate-pulse' : ''}`} />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium truncate ${
                            currentTrack?.id === track.id ? 'text-purple-700' : 'text-gray-900'
                          }`}>
                            {track.title}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">{track.artist}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {formatDuration(track.duration)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
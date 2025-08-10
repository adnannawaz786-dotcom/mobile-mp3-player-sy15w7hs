import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Play, Pause, Music } from 'lucide-react';
import { useAudio } from '../lib/audioContext';
import { getRecentlyPlayed, formatDuration } from '../lib/storage';

export default function Home() {
  const [recentTracks, setRecentTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useAudio();

  useEffect(() => {
    loadRecentTracks();
  }, []);

  const loadRecentTracks = async () => {
    try {
      const tracks = await getRecentlyPlayed();
      setRecentTracks(tracks);
    } catch (error) {
      console.error('Failed to load recent tracks:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold mb-6">Recently Played</h1>
          
          {recentTracks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-16"
            >
              <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No recent tracks
              </h3>
              <p className="text-sm text-muted-foreground">
                Start playing music to see your recently played songs here
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {recentTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-center p-4">
                        <div className="relative mr-4">
                          {track.artwork ? (
                            <img
                              src={track.artwork}
                              alt={track.title}
                              className="w-12 h-12 rounded-md object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                              <Music className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          {currentTrack?.id === track.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                            >
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </motion.div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{track.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {track.artist}
                          </p>
                          {track.duration && (
                            <p className="text-xs text-muted-foreground">
                              {formatDuration(track.duration)}
                            </p>
                          )}
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-4 h-10 w-10 rounded-full"
                          onClick={() => handlePlayPause(track)}
                        >
                          {currentTrack?.id === track.id && isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
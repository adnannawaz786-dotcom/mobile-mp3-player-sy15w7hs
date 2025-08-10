import '../styles/globals.css';
import { AudioProvider } from '../lib/audioContext';
import { useState, useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <AudioProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Component {...pageProps} />
      </div>
    </AudioProvider>
  );
}

export default MyApp;
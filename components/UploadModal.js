import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Plus, Music, FileMusic, AlertCircle } from 'lucide-react';

const UploadModal = ({ isOpen, onClose, onUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    const mp3Files = files.filter(file => 
      file.type === 'audio/mpeg' || 
      file.type === 'audio/mp3' || 
      file.name.toLowerCase().endsWith('.mp3')
    );

    if (mp3Files.length === 0) {
      setError('Please select valid MP3 files');
      return;
    }

    if (mp3Files.length !== files.length) {
      setError('Some files were skipped. Only MP3 files are supported.');
    } else {
      setError('');
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < mp3Files.length; i++) {
        const file = mp3Files[i];
        await processFile(file);
        setUploadProgress(((i + 1) / mp3Files.length) * 100);
      }
      
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        onClose();
      }, 500);
    } catch (err) {
      setError('Failed to upload files. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const processFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const audio = new Audio();
        audio.src = e.target.result;
        
        audio.onloadedmetadata = () => {
          const track = {
            id: Date.now() + Math.random(),
            title: file.name.replace('.mp3', ''),
            artist: 'Unknown Artist',
            album: 'Unknown Album',
            duration: Math.floor(audio.duration),
            src: e.target.result,
            addedAt: new Date().toISOString()
          };
          
          onUpload(track);
          resolve();
        };
        
        audio.onerror = () => reject(new Error('Invalid audio file'));
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Upload Music</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={uploading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <div
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center transition-all
                ${isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
                ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,audio/mpeg"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />

              <AnimatePresence mode="wait">
                {uploading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Music className="w-6 h-6 text-blue-600" />
                      </motion.div>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-2">Uploading...</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-blue-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{Math.round(uploadProgress)}%</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                      <FileMusic className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium mb-1">
                        Drop MP3 files here or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Support for multiple files
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                disabled={uploading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={openFileDialog}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Browse Files
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UploadModal;
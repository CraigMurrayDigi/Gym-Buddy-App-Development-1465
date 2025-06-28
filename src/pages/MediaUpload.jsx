import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/Navbar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUpload, FiImage, FiVideo, FiX } = FiIcons;

const MediaUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  
  const { user } = useAuth();
  const { uploadWorkoutMedia } = useData();

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image or video file`);
        return false;
      }
      
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Maximum file size is 50MB`);
        return false;
      }
      
      return true;
    });

    const filesWithMetadata = validFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      title: file.name.split('.')[0],
      type: file.type.startsWith('image/') ? 'image' : 'video',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    setSelectedFiles(prev => [...prev, ...filesWithMetadata]);
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileTitle = (fileId, newTitle) => {
    setSelectedFiles(prev => 
      prev.map(f => f.id === fileId ? { ...f, title: newTitle } : f)
    );
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    const results = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const fileData = selectedFiles[i];
      
      try {
        setUploadProgress(prev => ({ ...prev, [fileData.id]: 'uploading' }));
        
        const { media, error } = await uploadWorkoutMedia(
          user.id,
          fileData.file,
          fileData.title,
          fileData.type
        );

        if (error) {
          throw new Error(error);
        }

        setUploadProgress(prev => ({ ...prev, [fileData.id]: 'completed' }));
        results.push({ success: true, fileName: fileData.file.name });
        
      } catch (error) {
        console.error('Upload error:', error);
        setUploadProgress(prev => ({ ...prev, [fileData.id]: 'failed' }));
        results.push({ success: false, fileName: fileData.file.name, error: error.message });
      }
    }

    // Show results
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    if (successful > 0) {
      toast.success(`${successful} file(s) uploaded successfully!`);
    }
    
    if (failed > 0) {
      toast.error(`${failed} file(s) failed to upload`);
    }

    // Clear successful uploads
    setSelectedFiles(prev => 
      prev.filter(f => uploadProgress[f.id] !== 'completed')
    );
    
    setUploading(false);
    setUploadProgress({});
  };

  const getProgressStatus = (fileId) => {
    const status = uploadProgress[fileId];
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const getProgressColor = (fileId) => {
    const status = uploadProgress[fileId];
    switch (status) {
      case 'uploading':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <SafeIcon icon={FiUpload} className="text-4xl text-blue-600 mb-4 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Workout Media</h1>
          <p className="text-gray-600">Share your workout photos and videos with the community</p>
        </motion.div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* File Upload Area */}
          <div className="mb-8">
            <label className="block w-full">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                <SafeIcon icon={FiUpload} className="text-4xl text-gray-400 mb-4 mx-auto" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Click to upload files or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  Supports images and videos up to 50MB each
                </p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Selected Files ({selectedFiles.length})
              </h3>
              
              <div className="space-y-4">
                {selectedFiles.map((fileData) => (
                  <div key={fileData.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      {/* Preview */}
                      <div className="flex-shrink-0">
                        {fileData.type === 'image' ? (
                          <img
                            src={fileData.preview}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                            <SafeIcon icon={FiVideo} className="text-2xl text-blue-600" />
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={fileData.title}
                          onChange={(e) => updateFileTitle(fileData.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                          placeholder="Enter title for this media"
                        />
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>
                            {fileData.type === 'image' ? 'Image' : 'Video'} • {(fileData.file.size / 1024 / 1024).toFixed(1)} MB
                          </span>
                          <span className={getProgressColor(fileData.id)}>
                            {getProgressStatus(fileData.id)}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFile(fileData.id)}
                        disabled={uploading}
                        className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                      >
                        <SafeIcon icon={FiX} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {selectedFiles.length > 0 && (
            <div className="text-center">
              <button
                onClick={uploadFiles}
                disabled={uploading || selectedFiles.some(f => !f.title.trim())}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 mx-auto"
              >
                <SafeIcon icon={FiUpload} />
                <span>
                  {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
                </span>
              </button>
              
              {selectedFiles.some(f => !f.title.trim()) && (
                <p className="text-sm text-red-600 mt-2">
                  Please add titles to all files before uploading
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaUpload;
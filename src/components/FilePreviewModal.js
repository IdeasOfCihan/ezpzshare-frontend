import React, { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';

const FilePreviewModal = ({ isOpen, onClose, file, shareId, onDownload }) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (isOpen && file) {
      loadPreview();
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isOpen, file]);

  const loadPreview = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/share/${shareId}/preview/${file.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to load preview');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      setError('Failed to load preview');
      console.error('Preview error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-white">
            <p className="text-xl mb-2">⚠️ Preview not available</p>
            <p className="text-sm opacity-75">{error}</p>
            <button
              onClick={() => onDownload(file.id, file.originalName)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Download Instead
            </button>
          </div>
        </div>
      );
    }

    if (!previewUrl) return null;

    const fileType = file.fileType.toLowerCase();

    // Image preview
    if (fileType.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <img
            src={previewUrl}
            alt={file.originalName}
            className="max-w-full max-h-full object-contain"
            style={{ transform: `scale(${zoom / 100})` }}
          />
        </div>
      );
    }

    // PDF preview
    if (fileType.includes('pdf')) {
      return (
        <div className="h-full">
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title={file.originalName}
          />
        </div>
      );
    }

    // Video preview
    if (fileType.startsWith('video/')) {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <video
            src={previewUrl}
            controls
            className="max-w-full max-h-full"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            Your browser does not support video playback.
          </video>
        </div>
      );
    }

    // Audio preview
    if (fileType.startsWith('audio/')) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl mb-4">{file.originalName}</h3>
            <audio src={previewUrl} controls className="mb-4">
              Your browser does not support audio playback.
            </audio>
          </div>
        </div>
      );
    }

    // Text preview
    if (fileType.startsWith('text/')) {
      return (
        <div className="h-full p-8 overflow-auto">
          <iframe
            src={previewUrl}
            className="w-full h-full border-0 bg-white rounded"
            title={file.originalName}
          />
        </div>
      );
    }

    // Unsupported file type
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl mb-2">{file.originalName}</h3>
          <p className="text-sm opacity-75 mb-4">Preview not supported for this file type</p>
          <button
            onClick={() => onDownload(file.id, file.originalName)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Download File
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  const showZoomControls = file?.fileType.startsWith('image/') || file?.fileType.startsWith('video/');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50">
        <div className="text-white">
          <h2 className="text-lg font-semibold truncate">{file?.originalName}</h2>
          <p className="text-sm opacity-75">
            {file?.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {showZoomControls && (
            <>
              <button
                onClick={handleZoomOut}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white text-sm px-2">{zoom}%</span>
              <button
                onClick={handleZoomIn}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </>
          )}

          <button
            onClick={() => onDownload(file.id, file.originalName)}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden">
        {renderPreview()}
      </div>

      {/* Footer */}
      <div className="p-4 bg-black bg-opacity-50 text-center">
        <p className="text-white text-sm opacity-75">
          Press ESC to close • Click and drag to pan • Use zoom controls for images and videos
        </p>
      </div>
    </div>
  );
};

export default FilePreviewModal;
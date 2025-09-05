import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Lock, 
  Download, 
  Eye, 
  FileText, 
  Image, 
  Film, 
  Music, 
  Archive, 
  File,
  Calendar,
  User
} from 'lucide-react';

const SharedFolder = () => {
  const { shareId } = useParams();
  const [password, setPassword] = useState('');
  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accessing, setAccessing] = useState(false);

  const accessFolder = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error('Please enter the folder password');
      return;
    }

    setAccessing(true);
    try {
      const response = await axios.post(`/api/share/${shareId}/access`, { password });
      setFolder(response.data);
      toast.success('Access granted! You can now view and download files.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid password');
    } finally {
      setAccessing(false);
    }
  };

  const downloadFile = async (fileId, fileName) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/share/${shareId}/download/${fileId}`);
      const downloadUrl = response.data.downloadUrl;
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloading ${fileName}`);
    } catch (error) {
      toast.error('Download failed');
    } finally {
      setLoading(false);
    }
  };

  const previewFile = async (fileId, fileName) => {
    try {
      const previewUrl = `http://localhost:5000/api/share/${shareId}/preview/${fileId}`;
      window.open(previewUrl, '_blank');
    } catch (error) {
      toast.error('Preview not available for this file type');
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    if (fileType.startsWith('video/')) return <Film className="w-5 h-5 text-purple-500" />;
    if (fileType.startsWith('audio/')) return <Music className="w-5 h-5 text-green-500" />;
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="w-5 h-5 text-yellow-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canPreview = (fileType) => {
    return fileType.startsWith('image/') || 
           fileType.startsWith('video/') || 
           fileType.startsWith('audio/') ||
           fileType.includes('pdf') ||
           fileType.startsWith('text/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {!folder ? (
          // Password Entry Form
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Access Shared Files
              </h1>
              <p className="text-gray-600">
                Enter the folder password to view and download files
              </p>
            </div>

            <form onSubmit={accessFolder}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={accessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {accessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Accessing...
                  </div>
                ) : (
                  'Access Files'
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Share ID:</strong> {shareId}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                If you don't have the password, contact the person who shared this folder with you.
              </p>
            </div>
          </div>
        ) : (
          // Folder Contents
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
              <h1 className="text-2xl font-bold text-white mb-2">
                📁 {folder.name}
              </h1>
              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  <span className="text-sm">{folder.views} views</span>
                </div>
                <div className="flex items-center">
                  <File className="w-4 h-4 mr-1" />
                  <span className="text-sm">{folder.files?.length || 0} files</span>
                </div>
              </div>
            </div>

            {/* Files List */}
            <div className="p-6">
              {!folder.files || folder.files.length === 0 ? (
                <div className="text-center py-12">
                  <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No files available</h3>
                  <p className="text-gray-500">This folder doesn't contain any files yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Files ({folder.files.length})
                  </h2>
                  
                  {folder.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        {getFileIcon(file.fileType)}
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.originalName}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 space-x-3">
                            <span>{formatFileSize(file.fileSize)}</span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(file.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {canPreview(file.fileType) && (
                          <button
                            onClick={() => previewFile(file.id, file.originalName)}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Preview file"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </button>
                        )}
                        
                        <button
                          onClick={() => downloadFile(file.id, file.originalName)}
                          disabled={loading}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Download file"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Powered by EzPzShare</span>
                <span>Share ID: {shareId}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedFolder;
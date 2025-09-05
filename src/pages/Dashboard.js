import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import FileUpload from '../components/FileUpload';
import { 
  FolderPlus, 
  Eye, 
  Download, 
  Share2, 
  Trash2, 
  Calendar,
  Upload,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  File,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolder, setNewFolder] = useState({ name: '', password: '' });
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await axios.get('/api/folders');
      setFolders(response.data);
    } catch (error) {
      console.log('API Error:', error.message);
      toast.error('Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async (e) => {
    e.preventDefault();
    if (!newFolder.name.trim() || !newFolder.password) {
      toast.error('Please provide both folder name and password');
      return;
    }

    try {
      const response = await axios.post('/api/folders', newFolder);
      setFolders([response.data, ...folders]);
      setNewFolder({ name: '', password: '' });
      setShowCreateModal(false);
      toast.success('Folder created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create folder');
    }
  };

  const deleteFolder = async (folderId, folderName) => {
    if (!window.confirm(`Are you sure you want to delete "${folderName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`/api/folders/${folderId}`);
      setFolders(folders.filter(f => f.id !== folderId));
      toast.success('Folder deleted successfully');
    } catch (error) {
      toast.error('Failed to delete folder');
    }
  };

  const copyShareLink = (folder) => {
    const shareText = `🔗 Access shared files: ${window.location.origin}/share/${folder.shareId}\n🔑 Password needed to access files`;
    navigator.clipboard.writeText(shareText).then(() => {
      toast.success('Share information copied to clipboard!');
    });
  };

  const toggleFolderExpansion = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleUploadComplete = (folderId) => {
    fetchFolders();
    toast.success('Files uploaded successfully!');
  };

  const downloadFile = async (shareId, fileId, fileName) => {
    try {
      const response = await axios.get(`/api/share/${shareId}/download/${fileId}`);
      const downloadUrl = response.data.downloadUrl;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloading ${fileName}`);
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const canPreview = (fileType) => {
    return fileType.startsWith('image/') || 
           fileType.startsWith('video/') || 
           fileType.startsWith('audio/') ||
           fileType.includes('pdf') ||
           fileType.startsWith('text/');
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4 text-blue-500" />;
    if (fileType.startsWith('video/')) return <Film className="w-4 h-4 text-purple-500" />;
    if (fileType.startsWith('audio/')) return <Music className="w-4 h-4 text-green-500" />;
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="w-4 h-4 text-yellow-500" />;
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-gray-600">
          Manage your shared folders and files
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderPlus className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Folders</p>
                <p className="text-2xl font-bold text-gray-900">{folders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {folders.reduce((sum, folder) => sum + (folder.views || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {folders.reduce((sum, folder) => sum + (folder.downloads || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Folder Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FolderPlus className="w-5 h-5 mr-2" />
          Create New Folder
        </button>
      </div>

      {/* Folders List */}
      {folders.length === 0 ? (
        <div className="text-center py-12">
          <FolderPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No folders yet</h3>
          <p className="text-gray-500 mb-4">Create your first folder to start sharing files</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FolderPlus className="w-5 h-5 mr-2" />
            Create Folder
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {folders.map((folder) => (
            <div key={folder.id} className="bg-white rounded-lg shadow">
              {/* Folder Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleFolderExpansion(folder.id)}
                      className="mr-3 p-1 hover:bg-gray-100 rounded"
                    >
                      {expandedFolders.has(folder.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        📁 {folder.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {folder.files?.length || 0} files • Created {new Date(folder.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {folder.views || 0} views
                      </div>
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {folder.downloads || 0} downloads
                      </div>
                    </div>
                    
                    <button
                      onClick={() => copyShareLink(folder)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Copy share link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteFolder(folder.id, folder.name)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete folder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Share Info */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-1">Share Link:</p>
                  <p className="text-sm text-gray-600">
                    🔗https://ezpz-share.netlify.app/share/{folder.shareId}
                  </p>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedFolders.has(folder.id) && (
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* File Upload */}
                    <FileUpload 
                      folderId={folder.id} 
                      onUploadComplete={() => handleUploadComplete(folder.id)}
                    />
                    
                    {/* Files List */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Files ({folder.files?.length || 0})
                      </h4>
                      
                      {!folder.files || folder.files.length === 0 ? (
                        <div className="text-center py-8">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No files uploaded yet</p>
                          <p className="text-sm text-gray-400">Upload files using the form on the left</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          {folder.files.map((file, index) => (
                            <div key={file._id || index} className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex items-center flex-1 min-w-0">
                                {getFileIcon(file.fileType)}
                                <div className="ml-3 flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {file.originalName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(file.fileSize)} • {new Date(file.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                {canPreview(file.fileType) && (
                                  <a
                                    href={`https://ezpzshare-backend-production.up.railway.app${folder.shareId}/preview/${file._id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                    title="Preview file"
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    Preview
                                  </a>
                                )}
                                
                                <button
                                  onClick={() => downloadFile(folder.shareId, file._id, file.originalName)}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors"
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
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Folder</h2>
            <form onSubmit={createFolder}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolder.name}
                  onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter folder name"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Password
                </label>
                <input
                  type="password"
                  value={newFolder.password}
                  onChange={(e) => setNewFolder({ ...newFolder, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password (min 8 characters)"
                  minLength="8"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Others will need this password to access your shared files
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

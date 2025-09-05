import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Share2, 
  Shield, 
  Zap, 
  Download, 
  Upload, 
  Globe,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Landing = () => {
  const [shareId, setShareId] = useState('');
  const navigate = useNavigate();

  const handleAccessSharedFiles = (e) => {
    e.preventDefault();
    if (shareId.trim()) {
      navigate(`/share/${shareId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Share Files
              <br />
              <span className="text-blue-200">The Easy Way</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Create password-protected folders, upload files, and share them securely. 
              No accounts needed for recipients - just simple, secure file sharing.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Access Shared Files Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Access Shared Files
          </h2>
          <p className="text-gray-600 mb-8">
            Have a folder ID? Enter it below to access shared files.
          </p>
          
          <form onSubmit={handleAccessSharedFiles} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={shareId}
              onChange={(e) => setShareId(e.target.value)}
              placeholder="Enter folder share ID"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Access Files
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">EzPzShare</span>
            </div>
            
            <div className="text-gray-400 text-sm">
              <p>&copy; 2025 EzPzShare. Simple, secure file sharing.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
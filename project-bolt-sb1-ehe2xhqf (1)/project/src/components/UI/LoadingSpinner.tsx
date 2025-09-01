import React from 'react';
import { Brain } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <Brain className="absolute inset-0 w-8 h-8 text-blue-500 m-auto" />
        </div>
        <p className="text-gray-600 mt-4 font-medium">Loading AI StudyBuddy...</p>
      </div>
    </div>
  );
}
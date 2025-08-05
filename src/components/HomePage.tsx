import React from 'react';
import { Play, Upload, FileText, Sparkles } from 'lucide-react';
import { PageType } from '../types';

interface HomePageProps {
  setCurrentPage: (page: PageType) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Build a Test in <span className="text-teal-600">60 Seconds</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Practice Smarter with AI-Powered MCQs
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Upload, paste, or generate questions instantly. No account. No backend. Just learning.
          </p>
          <button
            onClick={() => setCurrentPage('create')}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors inline-flex items-center space-x-2"
          >
            <Play className="h-5 w-5" />
            <span>Start Creating Now</span>
          </button>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="bg-teal-100 dark:bg-teal-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-teal-600 dark:text-teal-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Upload Questions
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Drag and drop your JSON file with pre-made questions, or use our sample format.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="bg-teal-100 dark:bg-teal-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-teal-600 dark:text-teal-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Paste & Edit
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Paste JSON directly into our editor with validation and formatting support.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="bg-teal-100 dark:bg-teal-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-teal-600 dark:text-teal-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              AI Generate
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Let AI create questions on any topic with our intelligent question generator.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-teal-50 dark:bg-teal-900/20 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Create Your First Test?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of students and educators who use QuizSpark for efficient test preparation.
          </p>
          <button
            onClick={() => setCurrentPage('create')}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

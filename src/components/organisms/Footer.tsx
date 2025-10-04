import React from 'react';
import { Github } from 'lucide-react';

const Footer: React.FC = () => (
  <footer className="w-full max-w-4xl mx-auto text-center py-6 mt-12 border-t border-gray-200 dark:border-gray-700">
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Trip Visualizer. Built with ❤️.
      </p>
      <a
        href="https://github.com/sansunda/trip-visualizer"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
        aria-label="GitHub Repository"
      >
        <Github className="h-5 w-5" />
        <span>View on GitHub</span>
      </a>
    </div>
  </footer>
);

export default Footer;
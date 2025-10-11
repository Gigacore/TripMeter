import React from 'react';
import { Github } from 'lucide-react';

const Footer: React.FC = () => (
  <footer className="w-full text-center py-6 mt-12 border-t border-gray-200 dark:border-gray-700">
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
          &copy; {new Date().getFullYear()} TripMeter. Built with ❤️.
        </p>
        <a
          href="https://github.com/sansunda/trip-visualizer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors order-1 sm:order-2"
          aria-label="GitHub Repository"
        >
          <Github className="h-5 w-5" />
          <span>View on GitHub</span>
        </a>
      </div>
      <div className="mt-4">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          This is an unofficial tool and is not affiliated with, endorsed by, or in any way officially connected with Uber Technologies Inc. or any of its subsidiaries or its affiliates. The name Uber as well as related names, marks, emblems and images are registered trademarks of their respective owners.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
import React, { useRef, DragEvent, ChangeEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, Map, BarChart, Clock, ShieldCheck, FileDown, Loader2, Info, ArrowRight, GitMerge, Route, Sparkles, FileText } from 'lucide-react';
import Footer from './Footer';

interface LandingPageProps {
  onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onSampleFileLoad?: (file: File) => void; // Make this prop optional
  isProcessing: boolean;
  error: string;
  isDragging: boolean;
  onDragEvents: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onFileSelect, onSampleFileLoad, isProcessing, error, isDragging, onDragEvents, onDrop }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSampleLoading, setIsSampleLoading] = useState(false);

  // This function will handle both user-selected files and the sample file.
  const loadSampleFile = async () => {
    setIsSampleLoading(true);
    const response = await fetch('/sample_trips_data_fares_randomized.csv');
    const data = await response.blob();
    const file = new File([data], 'sample_trips_data_fares_randomized.csv', { type: 'text/csv' });

    if (onSampleFileLoad) {
      // If the parent provides a specific handler, use it.
      onSampleFileLoad(file);
    } else {
      // Otherwise, simulate a file input event to use the existing handler.
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      const syntheticEvent = { target: { files: dataTransfer.files } } as unknown as ChangeEvent<HTMLInputElement>;
      onFileSelect(syntheticEvent);
    }
    // The parent's isProcessing will take over, but we can reset our local state.
    // It will be disabled by isProcessing anyway.
    setIsSampleLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col items-center justify-center p-4 overflow-x-hidden">
      <div className="absolute inset-0 bg-white dark:bg-black bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      <main className="w-full max-w-5xl mx-auto text-center z-10">
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            Visualize Your Rides
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            From raw data to rich insights. See your trips like never before.
          </p>
        </div>

        <div className="bg-gray-100/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl px-8 pb-5 pt-6 border border-gray-200 dark:border-gray-700/50 shadow-lg dark:shadow-2xl dark:shadow-purple-500/10">
          <div
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${isDragging ? 'border-purple-500 bg-gray-200 dark:bg-gray-900' : 'border-gray-300 dark:border-gray-600/50 hover:border-purple-500/50'}`}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragEnter={onDragEvents}
            onDragOver={onDragEvents}
            onDragLeave={onDragEvents}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2 text-gray-700 dark:text-gray-300">
                <Loader2 className="h-12 w-12 animate-spin text-purple-500 dark:text-purple-400" />
                <p className="font-semibold mt-2">Processing your data...</p>
              </div>
            ) : (
              <>
                <div className="bg-gray-200 dark:bg-gray-800/80 p-4 rounded-full mb-4 border border-gray-300 dark:border-gray-700">
                  <UploadCloud className="text-gray-500 dark:text-gray-400 h-8 w-8" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">Drag & drop your <code className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-sm px-1 py-0.5 font-mono text-xs">trips_data-0.csv</code> file here</p>
                <p className="text-xs text-gray-500 mt-2">or click to select the file</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={onFileSelect}
              disabled={isProcessing}
              className="hidden"
              aria-label="File uploader"
            />
          </div>
          {error && (
            <div className="pt-4">
              <Alert variant="destructive">
                <AlertTitle>Analysis Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-500">
            <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-500" />
            <p>
              <span className="font-semibold text-gray-700 dark:text-gray-300">100% Private:</span> All processing is done securely in your browser.
            </p>
          </div>
        </div>

        <div className="my-12 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need your data file?{' '}
            <a href="https://help.uber.com/en/riders/article/request-a-copy-of-your-personal-data?nodeId=2c86900d-8408-4bac-b92a-956d793acd11" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-800 dark:text-gray-200 hover:underline">
              Learn how to get it from Uber
            </a>
            <span className="mx-2 text-gray-300 dark:text-gray-700">|</span>
            <button onClick={loadSampleFile} disabled={isProcessing || isSampleLoading} className="font-semibold text-gray-800 dark:text-gray-200 hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed">
              Try with a sample file
            </button>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          <FeatureCard icon={<Route className="text-blue-500 dark:text-blue-400 h-8 w-8 mb-3" />} title="Interactive Trip Map" description="Visualize your entire ride history on a global map." delay={100} />
          <FeatureCard icon={<BarChart className="text-purple-500 dark:text-purple-400 h-8 w-8 mb-3" />} title="In-depth Analytics" description="Get insights on fares, distance, duration, and cancellations." delay={200} />
          <FeatureCard icon={<Clock className="text-pink-500 dark:text-pink-400 h-8 w-8 mb-3" />} title="Activity Patterns" description="Discover your travel habits by time of day, week, and year." delay={300} />
          <FeatureCard icon={<GitMerge className="text-blue-500 dark:text-blue-400 h-8 w-8 mb-3" />} title="Streaks & Layovers" description="Analyze consecutive trips and the pauses in between." delay={400} />
          <FeatureCard icon={<Sparkles className="text-purple-500 dark:text-purple-400 h-8 w-8 mb-3" />} title="Cost Efficiency" description="Compare cost-efficiency across different Uber services." delay={500} />
          <FeatureCard icon={<FileDown className="text-pink-500 dark:text-pink-400 h-8 w-8 mb-3" />} title="KML Export" description="Export your trips to KML for use in Google Earth or other tools." delay={600} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; delay: number }> = ({ icon, title, description, delay }) => (
  <div
    className={`bg-gray-100/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-lg 
    transition-all duration-300 hover:border-purple-500/60 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 
    animate-fade-in opacity-0`}
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
  >
    {icon}
    <h3 className="font-semibold text-lg mb-1 text-black dark:text-white">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

export default LandingPage;
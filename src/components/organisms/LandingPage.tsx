import React, { useRef, DragEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, Map, BarChart, Clock, ShieldCheck, FileDown, Loader2, TrendingUp, Wallet, Info } from 'lucide-react';
import Footer from './Footer';

interface LandingPageProps {
  onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  isProcessing: boolean;
  error: string;
  isDragging: boolean;
  onDragEvents: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onFileSelect, isProcessing, error, isDragging, onDragEvents, onDrop }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e);
    if (e.target) {
      (e.target as HTMLInputElement).value = '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Visualize Your Uber Rides</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Upload your ride history CSV to generate an interactive map and detailed analytics of your trips.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800/50 rounded-xl px-8 pb-5 pt-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div
            className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center transition-colors duration-200 ease-in-out cursor-pointer ${isDragging ? 'border-primary bg-gray-50 dark:bg-gray-900/50' : 'border-gray-300 dark:border-gray-600'}`}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragEnter={onDragEvents}
            onDragOver={onDragEvents}
            onDragLeave={onDragEvents}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="font-semibold mt-2">Processing...</p>
              </div>
            ) : (
              <>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                  <UploadCloud className="text-gray-500 dark:text-gray-400 h-8 w-8" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">Drag & drop your CSV file here, or click to select</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Look for the <code className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-sm px-1 py-0.5 font-mono text-xs">trips_data-0.csv</code> file inside the <code className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-sm px-1 py-0.5 font-mono text-xs">Rider</code> folder.
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={isProcessing}
              className="hidden"
              aria-label="File uploader"
            />
          </div>
          {error && (
            <div className="pt-4">
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <p>
              <span className="font-semibold text-gray-700 dark:text-gray-300">100% Private:</span> All processing is done in your browser.
            </p>
          </div>
        </div>

        <div className="my-8 bg-white/80 dark:bg-gray-800/50 rounded-xl p-6 text-left border border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-md">
          <div className="flex items-start gap-4">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">How to get your Uber data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Follow the instructions on Uber's <a href="https://help.uber.com/en/riders/article/request-a-copy-of-your-personal-data?nodeId=2c86900d-8408-4bac-b92a-956d793acd11" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline decoration-dotted underline-offset-2 hover:decoration-solid">help page</a> to download your 'trips' data as a CSV file.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard icon={<Map className="text-primary h-8 w-8 mb-3" />} title="Interactive Map" description="Visualize all your trips on an interactive map." />
          <FeatureCard icon={<BarChart className="text-primary h-8 w-8 mb-3" />} title="In-depth Analytics" description="Insights on fare, distance, duration, waiting and cancelations." />
          <FeatureCard icon={<Clock className="text-primary h-8 w-8 mb-3" />} title="Activity Patterns" description="Understand your ride activity by time of day, week, and year." />
          <FeatureCard icon={<TrendingUp className="text-primary h-8 w-8 mb-3" />} title="Streaks" description="Analyze cancellation behavior and discover your travel streaks." />
          <FeatureCard icon={<Wallet className="text-primary h-8 w-8 mb-3" />} title="Cost Efficiency" description="Compare cost-efficiency across different service types." />
          <FeatureCard icon={<FileDown className="text-primary h-8 w-8 mb-3" />} title="KML Export" description="Export your trips to KML for use in Google Earth." />
        </div>
      </main>
      <Footer />
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white/80 dark:bg-gray-800/50 rounded-xl p-6 text-left border border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:shadow-primary/20 hover:-translate-y-1">
    {icon}
    <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

export default LandingPage;
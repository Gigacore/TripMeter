import React, { useRef, DragEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, Map, BarChart, Clock, ShieldCheck, FileDown, Loader2, TrendingUp, Wallet } from 'lucide-react';
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Vizualize Your Uber Rides</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Upload your ride history CSV to generate an interactive map and detailed analytics of your trips. See your travel patterns come to life.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800/50 rounded-xl p-8 mb-8 border border-gray-200 dark:border-gray-700 shadow-sm">
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
        </div>

        <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-6 flex items-center mb-12 border border-gray-200 dark:border-gray-700">
          <div className="bg-primary/20 p-3 rounded-full mr-4">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-left">100% Private and Secure</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-left">All processing is done directly in your browser. Your data never leaves your computer.</p>
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
  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-6 text-left border border-gray-200 dark:border-gray-700 shadow-sm">
    {icon}
    <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

export default LandingPage;
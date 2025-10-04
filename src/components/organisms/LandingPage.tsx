import React, { useRef, DragEvent, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, Map, BarChart, Clock, ShieldCheck, FileDown, Route, Scale, Loader2 } from 'lucide-react';

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

  return (
    <div className="flex h-full flex-col items-center justify-start p-4 sm:p-6 md:p-8 overflow-y-auto">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-50">
          Visualize Your Journeys
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">
          Upload your ride history CSV to generate an interactive map and detailed analytics of your trips. See your travel patterns come to life.
        </p>
      </div>

      <Card className="w-full max-w-lg mt-8 border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Upload your CSV file</CardTitle>
          <CardDescription>Drag and drop your file here or click the button below to select a file.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors duration-200 ease-in-out ${isDragging ? 'border-emerald-500 bg-slate-800/50' : 'border-slate-700 hover:border-slate-600'}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragEnter={onDragEvents}
            onDragOver={onDragEvents}
            onDragLeave={onDragEvents}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
                <p className="font-semibold text-slate-300 mt-2">Processing...</p>
              </div>
            ) : (
              <>
                <UploadCloud className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <p className="text-slate-400">Drag & drop your CSV file here</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => {
                onFileSelect(e);
                // @ts-ignore
                e.target.value = null;
              }}
              disabled={isProcessing}
              className="hidden"
              aria-label="File uploader"
            />
          </div>
        </CardContent>
        <div className="p-6 pt-0">
            <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="w-full">
            {isProcessing ? 'Processing...' : 'Select File'}
            </Button>
        </div>
        {error && (
          <div className="p-6 pt-0">
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
      </Card>

      <div className="w-full max-w-4xl mt-12 mb-5">
        <div className="flex items-center justify-center gap-4 rounded-lg bg-slate-800/50 p-6 border border-slate-700">
          <ShieldCheck className="h-10 w-10 text-emerald-500 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg text-slate-100">100% Private and Secure</h3>
            <p className="text-slate-400 text-sm">All processing is done directly in your browser. Your data never leaves your computer.</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mt-2">
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-slate-400">
          <FeatureCard icon={<Map className="h-6 w-6 text-emerald-400" />} title="Interactive Map" description="Visualize all your trips on an interactive map." />
          <FeatureCard icon={<BarChart className="h-6 w-6 text-emerald-400" />} title="In-depth Analytics" description="Insights on fare, distance, duration, and speed." />
          <FeatureCard icon={<Clock className="h-6 w-6 text-emerald-400" />} title="Activity Patterns" description="Understand your ride activity by time of day, week, and year." />
          <FeatureCard icon={<Route className="h-6 w-6 text-emerald-400" />} title="Streaks & Pauses" description="Analyze cancellation behavior and discover your travel streaks." />
          <FeatureCard icon={<Scale className="h-6 w-6 text-emerald-400" />} title="Cost Efficiency" description="Compare cost-efficiency across different service types." />
          <FeatureCard icon={<FileDown className="h-6 w-6 text-emerald-400" />} title="KML Export" description="Export your trips to KML for use in Google Earth." />
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="flex items-start gap-4 rounded-lg bg-slate-800/50 p-4">
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <h3 className="font-semibold text-slate-200">{title}</h3>
      <p className="text-sm">{description}</p>
    </div>
  </div>
);

export default LandingPage;
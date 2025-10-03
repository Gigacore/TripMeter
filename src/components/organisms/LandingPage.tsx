import React, { useRef, DragEvent, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud } from 'lucide-react';

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
    <div className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-xl border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800/60 shadow-2xl shadow-slate-950/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Visualize Your Journeys</CardTitle>
          <CardDescription className="text-slate-400">
            Upload your ride history CSV to generate an interactive map and detailed analytics of your trips.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`group relative grid w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed p-16 text-center transition-colors duration-300 ease-in-out ${isDragging ? 'border-emerald-500 bg-slate-800/50' : 'border-slate-700 hover:border-slate-600'}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragEnter={onDragEvents}
            onDragOver={onDragEvents}
            onDragLeave={onDragEvents}
          >
            <div className="flex flex-col items-center gap-4">
              <UploadCloud className="h-12 w-12 text-slate-500 transition-colors group-hover:text-slate-400" />
              <div className="text-slate-400">
                <span className="font-semibold text-slate-300">Drag and drop your file here</span>
                <p className="text-sm">or click to select a file from your computer</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={onFileSelect}
              disabled={isProcessing}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="File uploader"
            />
          </div>
          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="w-full" size="lg">
            {isProcessing ? 'Processing...' : 'Select File'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LandingPage;
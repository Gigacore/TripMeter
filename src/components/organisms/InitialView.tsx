import React, { useRef, DragEvent, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud } from 'lucide-react';

interface InitialViewProps {
  onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  isProcessing: boolean;
  error: string;
  isDragging: boolean;
  onDragEvents: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
}

const InitialView: React.FC<InitialViewProps> = ({ onFileSelect, isProcessing, error, isDragging, onDragEvents, onDrop }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center justify-center h-full p-4">
      <Card className="w-full max-w-lg border-slate-800 bg-slate-900/80 backdrop-blur-sm">
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
            <UploadCloud className="mx-auto mb-4 h-12 w-12 text-slate-400" />
            <p className="text-slate-400">Drag & drop your CSV file here</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => {
                onFileSelect(e);
                // Reset the input value to allow selecting the same file again
                if (e.target) {
                  (e.target as HTMLInputElement).value = '';
                }
              }}
              disabled={isProcessing}
              className="hidden"
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
    </div>
  );
};

export default InitialView;
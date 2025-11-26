import React, { useRef, DragEvent, ChangeEvent, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, Map, BarChart, Clock, ShieldCheck, FileDown, Loader2, Route, Sparkles, GitMerge, DollarSign, Globe, Activity, Scan } from 'lucide-react';
import Footer from './Footer';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useTranslation } from 'react-i18next';

interface LandingPageProps {
  onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onSampleFileLoad?: (file: File) => void;
  isProcessing: boolean;
  error: string;
  isDragging: boolean;
  onDragEvents: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onFileSelect, onSampleFileLoad, isProcessing, error, isDragging, onDragEvents, onDrop }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSampleLoading, setIsSampleLoading] = useState(false);

  const loadSampleFile = async () => {
    // ... existing code
    setIsSampleLoading(true);
    try {
      const response = await fetch('/sample_trips_data_fares_randomized.csv');
      const data = await response.blob();
      const file = new File([data], 'sample_trips_data_fares_randomized.csv', { type: 'text/csv' });

      if (onSampleFileLoad) {
        onSampleFileLoad(file);
      } else {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const syntheticEvent = { target: { files: dataTransfer.files } } as unknown as ChangeEvent<HTMLInputElement>;
        onFileSelect(syntheticEvent);
      }
    } catch (err) {
      console.error("Failed to load sample file", err);
    } finally {
      setIsSampleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col overflow-x-hidden font-sans selection:bg-purple-500/30">
      {/* Background Effects */}
      {/* Background Effects - Moved to App.tsx */}

      <main className="flex-grow flex flex-col justify-center px-4 py-6 lg:py-12 relative z-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center text-center mb-12 lg:mb-24 max-w-4xl mx-auto">
          {/* Hero & Actions */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 lg:mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-500">
                {t('visualizeYour')}
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x">
                {t('uberRides')}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6 lg:mb-8">
              {t('landingPageDescription')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="group flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300"
                  >
                    <Scan className="w-4 h-4" />
                    <span className="font-medium">{t('analyzeYourRides')}</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200 dark:border-gray-800">

                  <div className="mt-4">
                    <div className="relative group">
                      <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 ${isDragging ? 'opacity-80' : ''}`}></div>
                      <div className="relative bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
                        <div
                          className={`p-8 md:p-12 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer min-h-[300px]
                            ${isDragging ? 'bg-purple-50/50 dark:bg-purple-900/20 scale-[0.99]' : 'hover:bg-gray-50/50 dark:hover:bg-gray-900/20'}
                          `}
                          onClick={() => !isProcessing && fileInputRef.current?.click()}
                          onDrop={onDrop}
                          onDragEnter={onDragEvents}
                          onDragOver={onDragEvents}
                          onDragLeave={onDragEvents}
                        >
                          {isProcessing ? (
                            <div className="flex flex-col items-center gap-6">
                              <div className="relative">
                                <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 animate-pulse"></div>
                                <Loader2 className="h-16 w-16 animate-spin text-purple-600 dark:text-purple-400 relative z-10" />
                              </div>
                              <div className="space-y-2">
                                <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
                                  {t('crunchingTheNumbers')}
                                </p>
                                <p className="text-muted-foreground text-sm">{t('thisUsuallyTakesAFewSeconds')}</p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className={`mb-6 p-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-inner transition-transform duration-500 ${isDragging ? 'scale-110 rotate-6 ring-4 ring-purple-500/20' : 'group-hover:scale-105'}`}>
                                <Scan className={`h-12 w-12 ${isDragging ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'}`} />
                              </div>
                              <h3 className="text-2xl font-bold mb-3">
                                {isDragging ? t('dropIt') : t('dropYourFile')}
                              </h3>
                              <p className="text-muted-foreground mb-6 max-w-sm text-base">
                                {t('dragAndDropYour')} <code className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 font-mono text-xs text-purple-600 dark:text-purple-400 border border-gray-200 dark:border-gray-700">trips_data.csv</code> {t('fileHere')}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-gray-100/80 dark:bg-gray-800/50 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700/50">
                                <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                                <span>{t('processedLocally')}</span>
                              </div>
                            </>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={onFileSelect}
                            disabled={isProcessing}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="mt-6 animate-in fade-in slide-in-from-top-2">
                        <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400">
                          <AlertTitle>{t('oops')}</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <button
                onClick={loadSampleFile}
                disabled={isProcessing || isSampleLoading}
                className="px-6 py-3 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSampleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-purple-500" />}
                <span className="font-medium">{t('trySampleData')}</span>
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>{t('dontHaveYourData')}</span>
              <a
                href="https://help.uber.com/en/riders/article/request-a-copy-of-your-personal-data?nodeId=2c86900d-8408-4bac-b92a-956d793acd11"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-500 hover:underline transition-colors"
              >
                {t('learnHowToGetIt')}
              </a>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('everythingYouNeedToKnow')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('diveDeep')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Globe className="h-6 w-6 text-blue-500" />}
              title={t('interactiveMap')}
              description={t('interactiveMapDescription')}
              delay={0}
            />
            <FeatureCard
              icon={<Activity className="h-6 w-6 text-purple-500" />}
              title={t('deepAnalytics')}
              description={t('deepAnalyticsDescription')}
              delay={100}
            />
            <FeatureCard
              icon={<Clock className="h-6 w-6 text-pink-500" />}
              title={t('timePatterns')}
              description={t('timePatternsDescription')}
              delay={200}
            />
            <FeatureCard
              icon={<GitMerge className="h-6 w-6 text-indigo-500" />}
              title={t('streaks')}
              description={t('streaksDescription')}
              delay={300}
            />
            <FeatureCard
              icon={<DollarSign className="h-6 w-6 text-amber-500" />}
              title={t('costEfficiency')}
              description={t('costEfficiencyDescription')}
              delay={400}
            />
            <FeatureCard
              icon={<FileDown className="h-6 w-6 text-emerald-500" />}
              title={t('exportData')}
              description={t('exportDataDescription')}
              delay={500}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; delay: number }> = ({ icon, title, description, delay }) => (
  <div
    className="group p-8 rounded-3xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 hover:border-purple-500/30 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 relative overflow-hidden"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

    <div className="h-14 w-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm border border-gray-100 dark:border-gray-700">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">
      {description}
    </p>
  </div>
);

export default LandingPage;

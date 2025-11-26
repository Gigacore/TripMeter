import { ModeToggle } from '../molecules/ModeToggle';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings, Trash2, Download, Gauge } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { downloadKML } from '@/services/kmlService';
import { CSVRow } from '@/services/csvParser';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


interface HeaderProps {
  onReset: () => void;
  actionsEnabled: boolean;
  error: string;
  toggleSettings: () => void;
  rows: CSVRow[];
}

const Header: React.FC<HeaderProps> = ({ onReset, actionsEnabled, toggleSettings, rows }) => {
  const { t } = useTranslation();
  const handleDownloadKML = (which: 'both' | 'begin' | 'drop') => {
    downloadKML(rows, which);
  };

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto flex h-14 items-center px-4">
          <div className="mr-4 flex items-center">
            <div className="mr-6 flex items-center space-x-2 group">
              <Gauge className="h-6 w-6 text-purple-500 dark:text-purple-400 transition-transform duration-300 group-hover:rotate-12" />
              <span className="font-bold text-black dark:text-white">TripMeter</span>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            {actionsEnabled && (
              <>
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="smooth-transition hover:bg-purple-500/10">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">{t('download')}</span>
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>{t('downloadKML')}</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleDownloadKML('both')}>{t('downloadKMLCombined')}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownloadKML('begin')}>{t('downloadKMLPickups')}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownloadKML('drop')}>{t('downloadKMLDropoffs')}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onReset} className="smooth-transition hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">{t('clearData')}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('clearData')}</TooltipContent>
                </Tooltip>
              </>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleSettings} className="smooth-transition hover:bg-purple-500/10">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">{t('settings')}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('settings')}</TooltipContent>
            </Tooltip>
            <ModeToggle />
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};

export default Header;

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileOptimizationBanner() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            <div className="bg-yellow-500/90 dark:bg-yellow-600/90 backdrop-blur-sm text-white px-4 py-3 flex items-center justify-between shadow-lg animate-in slide-in-from-bottom-full duration-300">
                <p className="text-sm font-medium text-center flex-1 mr-2">
                    This application is optimized for larger screens. Please use a tablet or desktop for the best experience.
                </p>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-black/10 dark:hover:bg-white/10 shrink-0"
                    onClick={() => setIsVisible(false)}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Dismiss</span>
                </Button>
            </div>
        </div>
    );
}

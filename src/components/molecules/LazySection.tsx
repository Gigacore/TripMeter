import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface LazySectionProps {
    children: React.ReactNode;
    id?: string;
    className?: string;
}

/**
 * LazySection component that uses Intersection Observer to lazy load content
 * when it enters or is about to enter the viewport.
 */
const LazySection: React.FC<LazySectionProps> = ({ children, id, className }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentRef = ref.current;
        if (!currentRef) return;

        // Create an Intersection Observer instance
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasLoaded) {
                        setIsVisible(true);
                        setHasLoaded(true);
                        // Once loaded, we can disconnect the observer
                        observer.disconnect();
                    }
                });
            },
            {
                // Start loading 200px before the section enters the viewport
                rootMargin: '200px',
                // Trigger as soon as any part enters the margin
                threshold: 0,
            }
        );

        observer.observe(currentRef);

        // Cleanup
        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [hasLoaded]);

    return (
        <div ref={ref} className={className} data-lazy-section-id={id}>
            {isVisible ? (
                children
            ) : (
                <Card className="animate-pulse">
                    <CardHeader>
                        <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="h-64 bg-muted rounded"></div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default LazySection;

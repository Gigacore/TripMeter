import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from 'lucide-react';

interface FunFactProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    gradient?: string;
    textColor?: string;
    description?: string;
    className?: string;
}

export const FunFact: React.FC<FunFactProps> = ({
    label,
    value,
    icon: Icon,
    gradient = "from-gray-100 to-gray-200",
    textColor = "text-gray-900",
    description,
    className
}) => {
    return (
        <div className={cn("relative overflow-hidden rounded-xl p-6 border border-border/50", className)}>
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", gradient)} />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-3 rounded-lg bg-background/60 backdrop-blur-sm shadow-sm", textColor)}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-60 mix-blend-multiply dark:mix-blend-screen">
                        Did you know?
                    </span>
                </div>

                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">{label}</h4>
                    <div className={cn("text-3xl font-black tracking-tight mb-2", textColor)}>
                        {value}
                    </div>
                    {description && (
                        <p className="text-xs text-muted-foreground/80 font-medium leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

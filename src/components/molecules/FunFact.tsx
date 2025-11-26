import React from 'react';
import { LucideIcon } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../ui/tooltip";

interface FunFactProps {
    label: string;
    value: string;
    icon: LucideIcon;
    description: string;
    gradient?: string;
    textColor?: string;
    baseFact?: string;
}

export const FunFact: React.FC<FunFactProps> = ({
    label,
    value,
    icon: Icon,
    description,
    gradient = "from-blue-500/20 to-purple-500/20",
    textColor = "text-blue-700 dark:text-blue-300",
    baseFact
}) => {
    return (
        <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-4 border border-white/10 shadow-sm transition-all duration-300`}>
            <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg bg-white/40 dark:bg-black/20 backdrop-blur-sm ${textColor}`}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 bg-white/30 dark:bg-black/10 px-2 py-1 rounded-full cursor-help hover:bg-white/50 dark:hover:bg-black/30 transition-colors">
                                Did you know?
                            </span>
                        </TooltipTrigger>
                        {baseFact && (
                            <TooltipContent>
                                <p>{baseFact}</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="space-y-1">
                <h3 className={`text-2xl font-black tracking-tight ${textColor}`}>
                    {value}
                </h3>
                <p className="text-xs font-medium text-muted-foreground/90 leading-tight">
                    {description}
                </p>
                <p className="text-[10px] font-semibold opacity-60 uppercase tracking-widest pt-1">
                    {label}
                </p>
            </div>
        </div>
    );
};

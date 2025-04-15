
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

export default function InfoTooltip({ text }: { text: string }) {
    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Info className="text-gray-500 h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                    <span>{text}</span>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

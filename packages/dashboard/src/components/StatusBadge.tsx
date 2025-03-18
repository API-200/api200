import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

const getStatusColor = (status: number): string => {
    // Informational responses (100–199)
    if (status >= 100 && status < 200) {
        return "border-blue-500 text-blue-500";
    }
    // Successful responses (200–299)
    if (status >= 200 && status < 300) {
        return "border-green-500 text-green-500";
    }
    // Redirection messages (300–399)
    if (status >= 300 && status < 400) {
        return "border-yellow-500 text-yellow-500";
    }
    // Client error responses (400–499)
    if (status >= 400 && status < 500) {
        return "border-red-500 text-red-500";
    }
    // Server error responses (500–599)
    if (status >= 500) {
        return "border-red-700 text-red-700";
    }
    // Default case
    return "border-gray-500 text-gray-500";
};

type Props = {
    status: number;
};

export function StatusBadge({ status }: Props) {
    return (
        <Badge
            variant="outline"
            className={cn(
                "pointer-events-none shadow-none",
                getStatusColor(status)
            )}
        >
            {status}
        </Badge>
    );
}

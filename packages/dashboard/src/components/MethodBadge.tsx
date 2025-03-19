import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";

const methodColors: Record<string, string> = {
    GET: "bg-green-100 text-green-800",
    POST: "bg-blue-100 text-blue-800",
    PUT: "bg-yellow-100 text-yellow-800",
    DELETE: "bg-red-100 text-red-800",
    PATCH: "bg-purple-100 text-purple-800",
}

type Props = {
    method: string;
}

export function MethodBadge({method}:Props) {
    return (<Badge
            className={cn("pointer-events-none shadow-none", methodColors[method] || "bg-gray-100 text-gray-800")}>{method}</Badge>
    )
}

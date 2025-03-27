import { Tables } from '@/utils/supabase/database.types'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export const columns: ColumnDef<Tables<'incidents'> & { endpoint: Tables<'endpoints'> }>[] = [
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => {
            return <div className="font-medium">{row.getValue("title")}</div>
        },
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as string
            return <Badge variant="outline">{type || "Unknown"}</Badge>
        },
    },
    {
        accessorKey: "handled",
        header: "Status",
        cell: ({ row }) => {
            const handled = row.getValue("handled") as boolean
            return handled
                ? <Badge>Resolved</Badge>
                : <Badge variant="destructive">Active</Badge>
        },
    },
    {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => {
            return format(new Date(row.getValue("created_at")), "MMM dd HH:mm:ss")
        },
    },
]
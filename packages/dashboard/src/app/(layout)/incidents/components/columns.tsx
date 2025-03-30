import { ColumnDef } from '@tanstack/react-table'
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { MethodBadge } from '@/components/MethodBadge'
import { type EnhancedIncident } from '../types'

export const columns: ColumnDef<EnhancedIncident>[] = [
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => {
            return <div className="font-medium">{row.getValue("title")}</div>
        },
    },
    {
        accessorKey: "endpoint",
        header: "Endpoint",
        cell: ({ row }) => {
            const endpoint = row.getValue("endpoint") as EnhancedIncident['endpoint'];
            const service = endpoint.service;
            return <code>{(service.name + '/' + endpoint.name).replaceAll('//', '/')}</code>
        },
    },
    {
        accessorKey: "method",
        header: "Method",
        cell: ({ row }) => {
            const endpoint = row.getValue("endpoint") as EnhancedIncident['endpoint'];
            return <MethodBadge method={endpoint.method} />
        },
    },
    {
        accessorKey: "resolved",
        header: "Status",
        cell: ({ row }) => {
            return row.getValue("resolved")
                ? <Badge>Resolved</Badge>
                : <Badge variant="destructive">Active</Badge>
        },
    },
    {
        accessorKey: "created_at",
        header: "Occured At",
        cell: ({ row }) => {
            return format(new Date(row.getValue("created_at")), "MMM dd HH:mm:ss")
        },
    },
]
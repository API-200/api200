"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "../../../../../../../../components/ui/badge"
import { format } from "date-fns"
import { MethodBadge } from "../../../../../../../../components/MethodBadge";
import { StatusBadge } from "../../../../../../../../components/StatusBadge";
import { Tables } from "../../../../../../../../utils/supabase/database.types";

export const columns: ColumnDef<Tables<'logs'> & { endpoint: Tables<'endpoints'> }>[] = [
    {
        accessorKey: "method",
        header: "Method",
        cell: ({ row }) => {
            const method = row.original.endpoint?.method
            return <MethodBadge method={method} />
        },
    },
    {
        accessorKey: "req_url",
        header: "URL",
        cell: ({ row }) => {
            return <div className="truncate max-w-md">{row.original?.req_url || "N/A"}</div>
        },
    },
    {
        accessorKey: "res_code",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("res_code") as number
            return <StatusBadge status={status} />
        },
    },
    {
        accessorKey: "error",
        header: "Error",
        cell: ({ row }) => {
            const error = row.getValue("error")
            return error ? <Badge variant="destructive">Error</Badge> : null
        },
    },
    {
        accessorKey: "started_at",
        header: "Time",
        cell: ({ row }) => {
            return format(new Date(row.getValue("started_at")), "MMM dd HH:mm:ss.SS")
        },
    },
]


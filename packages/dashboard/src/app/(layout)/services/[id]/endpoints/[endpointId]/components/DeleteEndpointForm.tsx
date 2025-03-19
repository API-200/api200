"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner";
import { Tables } from '@/utils/supabase/database.types'

interface Props {
    endpoint: Tables<'endpoints'>;
    service: Tables<'services'>;
}

export default function DeleteEndpointForm({ endpoint, service }: Props) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setIsDeleting(true)
        fetch('/api/endpoints', {
            method: 'DELETE',
            body: JSON.stringify({
                endpointId: endpoint.id,
                endpointName: endpoint.name,
                serviceName: service.name,
                userId: service.user_id,
            }),
        })
            .then((res) => res.json())
            .then(() => router.push('/services/' + service.id))
            .catch((error) => toast.error('Something went wrong', { description: error.message }))
            .finally(() => setIsDeleting(false))
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Delete &#34;{endpoint.name}&#34;</CardTitle>
                        <CardDescription>This will delete endpoint data. This action cannot be
                            reversed.
                        </CardDescription>

                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isDeleting}>
                                {isDeleting ? "Deleting..." : "Delete Endpoint"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the endpoint and all
                                    associated data.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}>{isDeleting ? "Deleting..." : "Delete"}</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

            </CardHeader>
        </Card>
    )
}


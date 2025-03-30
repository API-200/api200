"use client"

import {useState} from "react"
import {useRouter} from "next/navigation"
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
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
import {createClient} from "@/utils/supabase/client";
import {toast} from "sonner";

interface DeleteServiceFormProps {
    name: string
    id: number
}

export default function DeleteServiceForm({name, id}: DeleteServiceFormProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleDelete = async () => {
        setIsDeleting(true)
        const {error} = await supabase.from("services").delete().eq("id", id)
        setIsDeleting(false)

        if (error) {
            toast.error('Something went wrong', {description: error.message})
        } else {
            router.push("/services")
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Delete &#34;{name}&#34;</CardTitle>
                        <CardDescription>This will delete service and endpoints data. This action cannot be
                            reversed.</CardDescription>

                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isDeleting}>
                                {isDeleting ? "Deleting..." : "Delete Service"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the service and all
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


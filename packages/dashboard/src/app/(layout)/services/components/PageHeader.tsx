import {Button} from "../../../../components/ui/button";
import Link from "next/link";
import {Import, PlusCircle} from "lucide-react";
import {Separator} from "../../../../components/ui/separator";

type Props = {
    isLoading?: boolean;
}

export const ServicePageHeader = ({isLoading}:Props)=>{
    return (
        <>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Services</h1>
                    <p className="text-muted-foreground">Manage and monitor your API services</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild disabled={isLoading}>
                        <Link href="/services/import">
                            <Import className="mr-2 h-4 w-4"/> Import Endpoints
                        </Link>
                    </Button>
                    <Button asChild disabled={isLoading}>
                        <Link href="/services/new">
                            <PlusCircle className="mr-2 h-4 w-4"/> Create Service
                        </Link>
                    </Button>
                </div>
            </div>
            <Separator className="my-4" />
        </>
    )
}

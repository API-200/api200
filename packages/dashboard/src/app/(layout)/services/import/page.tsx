"use client"

import { useState } from "react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "../../../../components/ui/breadcrumb"
import { ChevronRight } from "lucide-react"
import ImportResults from "./components/ImportResults";
import ImportOptions from "src/app/(layout)/services/import/components/ImportOptions";
import {ParsedSwaggerResult} from "./parseSwagger";

export default function ImportServicePage() {
    const [isReviewPhase, setIsReviewPhase] = useState(false)
    const [importData, setImportData] = useState<ParsedSwaggerResult | null>(null)

    const handleImportComplete = (data:any) => {
        setImportData(data)
        setIsReviewPhase(true)
    }

    const handleCancel = () => {
        setIsReviewPhase(false)
        setImportData(null)
    }

    return (
        <div className="container mx-auto">
            <div className="w-full lg:w-5/6 mx-auto">
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/services">Services</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator>
                            <ChevronRight className="h-4 w-4" />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Import</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {isReviewPhase && importData ? (
                    <ImportResults data={importData} onCancel={handleCancel} />
                ) : (
                    <ImportOptions onImportComplete={handleImportComplete} />
                )}
            </div>
        </div>
    )
}


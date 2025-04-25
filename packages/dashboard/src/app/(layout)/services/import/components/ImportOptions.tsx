"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertCircle, FileJson, FileSymlink, Search } from "lucide-react"
import { captureException } from "@sentry/nextjs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { type ParsedSwaggerResult, parseSwagger } from "@/app/(layout)/services/import/parseSwagger"
import { parsePostman } from "@/app/(layout)/services/import/parsePostman"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { apiServices } from "@/utils/data/apiServices"

interface ImportOptionsProps {
    onImportComplete: (data: ParsedSwaggerResult) => void
}

export default function ImportOptions({ onImportComplete }: ImportOptionsProps) {
    const [importMethod, setImportMethod] = useState<"postman" | "url" | "openapi" | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    const openApiFileRef = useRef<HTMLInputElement>(null)
    const postmanFileRef = useRef<HTMLInputElement>(null)

    const handleOpenApiClick = () => {
        setImportMethod("openapi")
        openApiFileRef.current?.click()
    }

    const handlePostmanClick = () => {
        setImportMethod("postman")
        postmanFileRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleImport(e.target.files[0], importMethod)
        }
    }

    const processImport = async (file: File | null, method: string | null) => {
        setIsLoading(true)
        setError(null)

        try {
            if (method === "openapi" && file) {
                const fileText = await file.text()
                const parsedResult = parseSwagger(fileText)
                console.log("parsedResult")
                console.log(parsedResult)
                return parsedResult
            } else if (method === "postman" && file) {
                const fileText = await file.text()
                const parsedResult = parsePostman(fileText)
                return parsedResult
            } else if (method === "url") {
                // URL import logic
            } else {
                throw new Error("Invalid import method or missing file")
            }
        } catch (e) {
            captureException(e)
            const errorMessage = e instanceof Error ? e.message : "Unknown error occurred during import"
            setError(errorMessage)
            throw e
        } finally {
            setIsLoading(false)
        }
    }

    const handleImport = async (file: File | null, method: string | null) => {
        try {
            const data = await processImport(file, method)
            onImportComplete(data!)
        } catch (error) {
            console.error("Error processing import:", error)
            // Error is already set in processImport
        }
    }

    const handleApiServiceSelect = (serviceName: string) => {
        // This would typically initiate the import process for the selected API service
        console.log(`Selected API service: ${serviceName}`)
        // For demonstration, we could show a loading state or navigate to a specific import flow
    }

    const filteredApiServices = apiServices.filter((service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
        <div>

            <div className="mb-12">
                <h2 className="text-2xl font-semibold">Import Your Endpoints</h2>
                <p className="text-muted-foreground mb-4">
                    Upload your API specification files to import endpoints directly into your project.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <div className="flex flex-col h-full">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <FileJson className="h-10 w-10 text-primary" />
                                    <div>
                                        <CardTitle className="mb-1">OpenAPI / Swagger</CardTitle>
                                        <CardDescription>Import API endpoints from OpenAPI or Swagger specification files</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <div className="mt-auto p-6 pt-0">
                                <Button variant="outline" onClick={handleOpenApiClick} disabled={isLoading}>
                                    Select File
                                </Button>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={openApiFileRef}
                            className="hidden"
                            accept=".json,.yaml,.yml"
                            onChange={handleFileChange}
                        />
                    </Card>

                    {/* Postman Import Option */}
                    <Card>
                        <div className="flex flex-col h-full">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <FileSymlink className="h-10 w-10 text-primary" />
                                    <div>
                                        <CardTitle className="mb-1">Postman (Experimental)</CardTitle>
                                        <CardDescription>Import API endpoints from Postman collection files</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <div className="mt-auto p-6 pt-0">
                                <Button variant="outline" onClick={handlePostmanClick} disabled={isLoading}>
                                    Select File
                                </Button>
                            </div>
                        </div>
                        <input type="file" ref={postmanFileRef} className="hidden" accept=".json" onChange={handleFileChange} />
                    </Card>
                </div>

                {error && (
                    <Alert variant="destructive" className="mt-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </div>

            <div>
                <h2 className="text-2xl font-semibold">Browse API Services</h2>
                <p className="text-muted-foreground mb-4">Explore and import from our collection of popular API services.</p>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search API services..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredApiServices.map((service) => (
                        <Card key={service.name} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                <div className="p-6 flex items-center justify-center md:justify-start">
                                    <Image
                                        src={service.image || "/placeholder.svg"}
                                        alt={`${service.name} logo`}
                                        width={64}
                                        height={64}
                                        className="rounded-md"
                                    />
                                </div>
                                <CardContent className="flex-1 p-6 pt-4 md:pt-6">
                                    <CardTitle className="mb-2">{service.name}</CardTitle>
                                    <CardDescription className="mb-4">{service.description}</CardDescription>
                                    <Button variant="outline" onClick={() => handleApiServiceSelect(service.name)} className="mt-auto">
                                        Import
                                    </Button>
                                </CardContent>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

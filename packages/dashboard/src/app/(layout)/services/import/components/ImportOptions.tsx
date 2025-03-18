"use client"

import {useRef, useState} from "react"
import {Button} from "../../../../../components/ui/button"
import {Card, CardDescription, CardHeader, CardTitle} from "../../../../../components/ui/card"
import {AlertCircle, FileJson, FileSymlink} from "lucide-react"
import {captureException} from "@sentry/nextjs"
import {Alert, AlertDescription, AlertTitle} from "../../../../../components/ui/alert"
import {ParsedSwaggerResult, parseSwagger} from "../parseSwagger";
import {parsePostman} from "../parsePostman";


interface ImportOptionsProps {
    onImportComplete: (data: ParsedSwaggerResult) => void;
}

export default function ImportOptions({onImportComplete}: ImportOptionsProps) {
    const [importMethod, setImportMethod] = useState<"postman" | "url" | "openapi" | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

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
                const fileText = await file.text();

                const parsedResult = parseSwagger(fileText);

                return parsedResult
            } else if (method === "postman" && file) {

                const fileText = await file.text();

                const parsedResult = parsePostman(fileText);

                return parsedResult

            } else if (method === "url") {

            } else {
                throw new Error("Invalid import method or missing file");
            }
        } catch (e) {
            captureException(e);
            const errorMessage = e instanceof Error ? e.message : "Unknown error occurred during import";
            setError(errorMessage);
            throw e;
        } finally {
            setIsLoading(false);
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


    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 tracking-tight">Import endpoints</h1>

            <div className="grid gap-6">
                {/* OpenAPI/Swagger Import Option */}
                <Card>
                    <div className="flex flex-col md:flex-row">
                        <div className="flex-grow">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <FileJson className="h-10 w-10 text-primary"/>
                                    <div>
                                        <CardTitle className="mb-1">OpenAPI / Swagger</CardTitle>
                                        <CardDescription>Import API endpoints from OpenAPI or Swagger specification
                                            files</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </div>
                        <div className="flex items-center p-6">
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
                    <div className="flex flex-col md:flex-row">
                        <div className="flex-grow">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <FileSymlink className="h-10 w-10 text-primary"/>
                                    <div>
                                        <CardTitle className="mb-1">Postman (Experimental)</CardTitle>
                                        <CardDescription>Import API endpoints from Postman collection
                                            files</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </div>
                        <div className="flex items-center p-6">
                            <Button variant="outline" onClick={handlePostmanClick} disabled={isLoading}>
                                Select File
                            </Button>
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={postmanFileRef}
                        className="hidden"
                        accept=".json"
                        onChange={handleFileChange}
                    />
                </Card>

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4"/>
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    )
}

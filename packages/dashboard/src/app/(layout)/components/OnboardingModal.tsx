"use client"

import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {ArrowRight, Download, PlayCircle, Settings} from "lucide-react"
import {useRouter} from "next/navigation"
import {toast} from "sonner"
import {createClient} from "@/utils/supabase/client"
import {parseSwagger} from "@/app/(layout)/services/import/parseSwagger"
import {demoSwagger} from "@/utils/data/demoSwagger"

const completeOnboarding = () => {
    localStorage.setItem('onboarding_complete', 'true')
}

export default function OnboardingModal() {
    const router = useRouter()
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const checkUserServices = async () => {
            try {
                const onboardingComplete = localStorage.getItem('onboarding_complete') === 'true'
                if (onboardingComplete) {
                    return
                }

                const {data: services, error} = await supabase
                    .from('services')
                    .select('id')
                    .limit(1)

                if (error) {
                    console.error("Error checking user services:", error)
                    return
                }

                if (!services || services.length === 0) {
                    setIsOpen(true)
                } else {
                    completeOnboarding()
                }
            } catch (error) {
                console.error("Error in onboarding check:", error)
            }
        }

        checkUserServices()
    }, [supabase])

    const onDemoProject = async () => {
        try {
            setIsLoading(true)
            const demoSwaggerString = JSON.stringify(demoSwagger)
            const parsedResult = parseSwagger(demoSwaggerString)
            const {data: serviceData, error: serviceError} = await supabase
                .from('services')
                .insert({
                    ...parsedResult.service,
                    is_mcp_enabled: true,
                    name: "Demo Project",
                    description: "Demo project for JSON Placeholder API with enabled MCP Server",
                })
                .select()
                .single()

            if (serviceError) {
                throw serviceError
            }
            const endpointsToInsert = parsedResult.endpoints.map(e => ({
                ...e,
                service_id: serviceData.id
            }))
            const {error: endpointsError} = await supabase
                .from('endpoints')
                .insert(endpointsToInsert)

            if (endpointsError) {
                throw endpointsError
            }
            completeOnboarding()
            setIsOpen(false)
            toast.success("Demo project created successfully!")
            router.push(`/services/${serviceData.id}`)

        } catch (error) {
            console.error("Error creating demo project:", error)
            toast.error("Failed to create demo project", {
                description: error instanceof Error ? error.message : "Unknown error"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const onImport = () => {
        completeOnboarding()
        router.push("/services/import")
        setIsOpen(false)
    }

    const onManual = () => {
        completeOnboarding()
        router.push("/services/new")
        setIsOpen(false)
    }

    const onExploreOwn = () => {
        completeOnboarding()
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Welcome to API 200</DialogTitle>
                    <DialogDescription>
                        Choose one of the following options to get started with your API journey.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Card
                        onClick={onDemoProject}
                        className={`cursor-pointer hover:border-primary/50 transition-colors flex justify-between items-center ${isLoading ? 'opacity-70' : ''}`}
                    >
                        <div className="flex-1">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center">
                                    <PlayCircle className="mr-2 h-5 w-5 text-emerald-500"/>
                                    Start with demo project
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Get up and running quickly with a pre-configured demo project that showcases the
                                    capabilities of API 200.
                                </CardDescription>
                            </CardContent>
                        </div>
                        <div className="pr-6">
                            <Button variant="ghost" disabled={isLoading}>
                                {isLoading ? "Creating..." : (
                                    <>Get started <ArrowRight className="ml-2 h-4 w-4"/></>
                                )}
                            </Button>
                        </div>
                    </Card>

                    <Card
                        onClick={onImport}
                        className="cursor-pointer hover:border-primary/50 transition-colors flex justify-between items-center"
                        aria-disabled={isLoading}
                    >
                        <div className="flex-1">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center">
                                    <Download className="mr-2 h-5 w-5 text-sky-500"/>
                                    Import API
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Import your existing API from OpenAPI/Swagger, Postman, or other formats to get
                                    started
                                    quickly.
                                </CardDescription>
                            </CardContent>
                        </div>
                        <div className="pr-6">
                            <Button variant="ghost" disabled={isLoading}>
                                Import now <ArrowRight className="ml-2 h-4 w-4"/>
                            </Button>
                        </div>
                    </Card>

                    <Card
                        onClick={onManual}
                        className="cursor-pointer hover:border-primary/50 transition-colors flex justify-between items-center"
                        aria-disabled={isLoading}
                    >
                        <div className="flex-1">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center">
                                    <Settings className="mr-2 h-5 w-5 text-violet-500"/>
                                    Create service manually
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Build your API service from scratch with full control over all settings and
                                    configurations.
                                </CardDescription>
                            </CardContent>
                        </div>
                        <div className="pr-6">
                            <Button variant="ghost" disabled={isLoading}>
                                Create service <ArrowRight className="ml-2 h-4 w-4"/>
                            </Button>
                        </div>
                    </Card>
                </div>

                <div className="flex justify-center">
                    <Button
                        variant="link"
                        size="sm"
                        onClick={onExploreOwn}
                        className="text-muted-foreground"
                        disabled={isLoading}
                    >
                        I'll explore on my own
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

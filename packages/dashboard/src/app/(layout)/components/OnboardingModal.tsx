"use client"

import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {ArrowRight, Download, PlayCircle, Settings} from "lucide-react"
import {useRouter} from "next/navigation";

export default function OnboardingModal() {
    const router = useRouter()

    const [isOpen, setIsOpen] = useState(false)

    // Show the modal when the component mounts (for new users)
    useEffect(() => {
        // In a real app, you'd check if the user is new before showing the modal
        // For example: if (localStorage.getItem('isNewUser') === 'true')
        setIsOpen(true)

        // You could set a flag to not show this again
        // localStorage.setItem('isNewUser', 'false')
    }, [])

    const onDemoProject = () =>{

        setIsOpen(false)
    }

    const onImport = ()=>{
        router.push("/services/import")
        setIsOpen(false)
    }

    const onManual = ()=>{
        router.push("/services/new")
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
                    <Card className="cursor-pointer hover:border-primary/50 transition-colors flex justify-between items-center">
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
                            <Button variant="ghost">
                                Get started <ArrowRight className="ml-2 h-4 w-4"/>
                            </Button>
                        </div>
                    </Card>

                    <Card onClick={onImport} className="cursor-pointer hover:border-primary/50 transition-colors flex justify-between items-center">
                        <div className="flex-1">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center">
                                    <Download className="mr-2 h-5 w-5 text-sky-500"/>
                                    Import API
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Import your existing API from OpenAPI/Swagger, Postman, or other formats to get started
                                    quickly.
                                </CardDescription>
                            </CardContent>
                        </div>
                        <div className="pr-6">
                            <Button variant="ghost">
                                Import now <ArrowRight className="ml-2 h-4 w-4"/>
                            </Button>
                        </div>
                    </Card>

                    <Card onClick={onManual} className="cursor-pointer hover:border-primary/50 transition-colors flex justify-between items-center">
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
                            <Button variant="ghost">
                                Create service <ArrowRight className="ml-2 h-4 w-4"/>
                            </Button>
                        </div>
                    </Card>
                </div>

                <div className="flex justify-center">
                    <Button variant="link" size="sm" onClick={() => setIsOpen(false)} className="text-muted-foreground">
                        I'll explore on my own
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

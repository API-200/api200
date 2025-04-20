"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowRight, Server, Code } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ServiceOnboardingModal() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const hasSeenServiceCreatedModal = localStorage.getItem("service_created_modal_shown") === "true"

        if (!hasSeenServiceCreatedModal) {
            setIsOpen(true)
        }
    }, [])

    const completeModal = () => {
        localStorage.setItem("service_created_modal_shown", "true")
        setIsOpen(false)
    }

    const onUseMcpServer = () => {
        completeModal()
        router.push("/credentials")
    }

    const onUseWithApi = () => {
        completeModal()
        router.push("/credentials")
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>You created your first service!</DialogTitle>
                    <DialogDescription>How are you going to use it?</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Card
                        onClick={onUseMcpServer}
                        className="cursor-pointer hover:border-primary/50 transition-colors flex justify-between items-center"
                    >
                        <div className="flex-1">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center">
                                    <Server className="mr-2 h-5 w-5 text-emerald-500" />
                                    Use as MCP server
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Get your config to use this service with Claude, Cursor, and other MCP-compatible clients.
                                </CardDescription>
                            </CardContent>
                        </div>
                        <div className="pr-6">
                            <Button variant="ghost">
                                Continue <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </Card>

                    <Card
                        onClick={onUseWithApi}
                        className="cursor-pointer hover:border-primary/50 transition-colors flex justify-between items-center"
                    >
                        <div className="flex-1">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center">
                                    <Code className="mr-2 h-5 w-5 text-sky-500" />
                                    Use as API
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Get an API key to start making requests directly from your app or backend.
                                </CardDescription>
                            </CardContent>
                        </div>
                        <div className="pr-6">
                            <Button variant="ghost">
                                Continue <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                </div>
                <div className="flex justify-center">
                    <Button
                        variant="link"
                        size="sm"
                        onClick={completeModal}
                        className="text-muted-foreground"
                    >
                        Skip for now - I’ll set it up later
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

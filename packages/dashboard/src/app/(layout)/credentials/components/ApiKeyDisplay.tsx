"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Copy, CopyCheck, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import {useRouter} from "next/navigation";

export const ApiKeyDisplay = () => {
    const [key, setKey] = useState<string | null>(null)
    const [isCopied, setIsCopied] = useState(false)
    const [isReissuing, setIsReissuing] = useState(false)
    const router = useRouter()

    useEffect(() => {
        fetchApiKey()
    }, [])

    const fetchApiKey = async () => {
        try {
            const response = await fetch("/api/api-key")
            if (!response.ok) throw new Error("Failed to fetch API key")
            const data = await response.json()
            setKey(data.apiKey)
        } catch (error) {
            console.error("Failed to fetch API key:", error)
            toast.error("Failed to fetch API key")
        }
    }

    const handleCopy = async () => {
        if (!key) return
        try {
            await navigator.clipboard.writeText(key)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy API key:", err)
            toast.error("Failed to copy API key")
        }
    }

    const handleReissue = async () => {
        setIsReissuing(true)
        try {
            const response = await fetch("/api/api-key", {
                method: "POST",
            })
            if (!response.ok) throw new Error("Failed to reissue API key")
            const data = await response.json()
            setKey(data.apiKey)
            toast.success("API key reissued successfully")
            router.refresh()
        } catch (err) {
            console.error("Failed to reissue API key:", err)
            toast.error("Failed to reissue API key")
        } finally {
            setIsReissuing(false)
        }
    }

    if (!key) return <div>Loading...</div>

    return (
        <div className="bg-gray-100 p-4 rounded-md">
            <div className="flex items-center mb-4">
                <code className="flex-grow p-2 bg-white rounded-l-md font-mono text-sm">{key}</code>
                <Button variant="outline" size="icon" className="rounded-l-none" onClick={handleCopy}>
                    {isCopied ? <CopyCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    <span className="sr-only">Copy API Key</span>
                </Button>
            </div>
            <Button variant="outline" className="w-full" onClick={handleReissue} disabled={isReissuing}>
                {isReissuing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Reissue API Key
            </Button>
        </div>
    )
}


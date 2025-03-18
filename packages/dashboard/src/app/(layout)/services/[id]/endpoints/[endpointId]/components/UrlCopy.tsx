"use client"


import {Button} from "../../../../../../../components/ui/button";
import {Copy, CopyCheck} from "lucide-react";
import {useState} from "react";

export const UrlCopy = ({url}: { url: string }) => {
    const [isCopied, setIsCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy URL:', err)
        }
    }

    return (<div className="flex items-center mt-4">
        <code className="flex-grow p-2 bg-gray-100 rounded-l-md font-mono text-sm">{url}</code>
        <Button
            variant="outline"
            size="icon"
            className="rounded-l-none"
            onClick={handleCopy}
        >
            {isCopied ? (
                <CopyCheck className="h-4 w-4 text-green-500"/>
            ) : (
                <Copy className="h-4 w-4"/>
            )}
            <span className="sr-only">Copy API URL</span>
        </Button>
    </div>)
}


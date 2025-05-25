"use client"

import { FC, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {Card, CardContent, CardDescription, CardTitle} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, CopyCheck, Download } from "lucide-react"
import {getCodeExample, Language, Method} from "@/utils/getCodeExample";

interface ApiExampleProps {
    url: string
    method: Method
}

export const ApiExample: FC<ApiExampleProps> = ({ url, method }) => {
    const [language, setLanguage] = useState<Language>("js")
    const [isCopied, setIsCopied] = useState(false)
    const [isSdkCopied, setIsSdkCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(getCodeExample(language, url, method))
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy code:', err)
        }
    }

    const handleCopyInstallCommand = async () => {
        try {
            await navigator.clipboard.writeText("npx api200-generate-sdk -t YOUR_API_TOKEN")
            setIsSdkCopied(true)
            setTimeout(() => setIsSdkCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy install command:', err)
        }
    }

    return (
        <div className="w-full space-y-4">
            {/* SDK Installation Instructions for JavaScript */}
            {language === "js" && (
                <Card className="w-full bg-blue-50 border-blue-200 shadow-none">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <CardTitle className="text-sm text-blue-900">
                                    📦 SDK Installation
                                </CardTitle>
                                <CardDescription className="text-xs text-blue-700">
                                    Generate your personalized SDK with your API token
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyInstallCommand}
                                className="h-8 w-8 p-0 border-blue-300 hover:bg-blue-100"
                            >
                                {isSdkCopied? <CopyCheck className="h-3 w-3 text-blue-600"/> :<Copy className="h-3 w-3 text-blue-600" />}

                            </Button>
                        </div>
                        <div className="bg-white rounded border border-blue-200 p-3">
                            <code className="text-sm text-blue-800 font-mono">
                                npx api200-generate-sdk -t YOUR_API_TOKEN
                            </code>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Code Example */}
            <Card className="w-full bg-gray-100 shadow-none">
                <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                            <SelectTrigger className="w-[160px] bg-white h-8 text-xs">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="js">
                                    <div className="flex items-center gap-2">
                                        <span>JavaScript</span>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">SDK</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="php">PHP</SelectItem>
                                <SelectItem value="go">Go</SelectItem>
                                <SelectItem value="rust">Rust</SelectItem>
                                <SelectItem value="java">Java</SelectItem>
                                <SelectItem value="csharp">C#</SelectItem>
                                <SelectItem value="curl">cURL</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 w-8 p-0">
                            {isCopied ? (
                                <CopyCheck className="h-4 w-4 text-green-500" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <pre className="text-sm overflow-x-auto">
                        <code>{getCodeExample(language, url, method)}</code>
                    </pre>
                </CardContent>
            </Card>
        </div>
    )
}

export default ApiExample

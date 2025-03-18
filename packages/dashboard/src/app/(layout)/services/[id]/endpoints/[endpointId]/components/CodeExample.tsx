"use client"

import { FC, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../../../components/ui/select"
import { Card, CardContent } from "../../../../../../../components/ui/card"
import { Button } from "../../../../../../../components/ui/button"
import { Copy, CopyCheck } from "lucide-react"
import {getCodeExample, Language, Method} from "../../../../../../../utils/getCodeExample";

interface ApiExampleProps {
    url: string
    method: Method
}


export const ApiExample: FC<ApiExampleProps> = ({ url, method }) => {
    const [language, setLanguage] = useState<Language>("js")
    const [isCopied, setIsCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(getCodeExample(language, url, method))
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy code:', err)
        }
    }

    return (
        <Card className={`w-full bg-gray-100 shadow-none`}>
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                        <SelectTrigger className="w-[120px] bg-white h-8 text-xs">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="js">JavaScript</SelectItem>
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
    )
}

export default ApiExample

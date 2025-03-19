"use client"

import {useState} from "react"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import * as z from "zod"

import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Switch} from "@/components/ui/switch"
import {toast} from "sonner"
import {Loader2} from "lucide-react"
import {useRouter} from "next/navigation"

const formSchema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .regex(/^[a-z\-_]+$/, "Name can only contain lower case letters, hyphen, and underscore"),
    description: z.string().optional(),
    baseUrl: z.string().url("Invalid URL"),
    enableAuth: z.boolean(),
    authType: z.enum(["api_key", "token"]).optional().nullable(),
    apiKey: z.string().optional().nullable(),
    apiKeyLocation: z.enum(["query", "header"]).optional().nullable(),
    headerName: z.string().optional().nullable(),
    queryParamName: z.string().optional().nullable(),
    token: z.string().optional().nullable(),
})

interface AuthConfig {
    api_key?: string;
    api_key_param?: string;
    api_key_header?: string;
    api_key_location: 'header' | 'query';
    bearer_token?: string;
}

interface ServiceFormProps {
    initialData?: {
        id?: string;
        name: string;
        description?: string;
        base_url: string;
        auth_enabled: boolean;
        auth_type?: "api_key" | "token";
        auth_config?: AuthConfig;
    };
    mode?: 'create' | 'update';
}

export function APIServiceForm({initialData, mode = 'create'}: ServiceFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name ?? "",
            description: initialData?.description ?? "",
            baseUrl: initialData?.base_url ?? "",
            enableAuth: initialData?.auth_enabled ?? false,
            authType: initialData?.auth_type,
            apiKey: initialData?.auth_config?.api_key ?? "",
            apiKeyLocation: initialData?.auth_config?.api_key_location,
            headerName: initialData?.auth_config?.api_key_header ?? "",
            queryParamName: initialData?.auth_config?.api_key_param ?? "",
            token: initialData?.auth_config?.bearer_token ?? "",
        },
    })

    const {watch} = form

    const enableAuth = watch("enableAuth")
    const authType = watch("authType")
    const apiKeyLocation = watch("apiKeyLocation")

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsSubmitting(true);
            const processedBaseUrl = values.baseUrl.replace(/\/+$/, "");

            const serviceData = {
                id: initialData?.id,
                mode,
                auth_enabled: values.enableAuth,
                auth_type: values.authType,
                base_url: processedBaseUrl,
                description: values.description,
                name: values.name,
                auth_config: {
                    api_key: values.apiKey,
                    api_key_header: values.headerName,
                    api_key_location: values.apiKeyLocation,
                    api_key_param: values.queryParamName,
                    bearer_token: values.token,
                },
            };

            const response = await fetch("/api/service", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(serviceData),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(`Service ${mode === "create" ? "created" : "updated"} successfully.`);
                if (mode === "create") {
                    form.reset();
                    router.push(`/services/${result.id}`);
                } else {
                    router.refresh();
                }
            } else {
                throw new Error(result.error || "Operation failed");
            }
        } catch (e) {
            toast.error(`Failed to ${mode} service.`, {
                description: (e as Error)?.message,
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card className="shadow-none">
            <CardHeader>
                <CardTitle>{mode === 'create' ? 'New' : 'Edit'} API Service</CardTitle>
                <CardDescription>
                    {mode === 'create' ? 'Create a new' : 'Update your'} API service configuration
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="my-api-service" {...field} />
                                    </FormControl>
                                    <FormDescription>Enter a name for your API service.
                                        This will be used as part of route for your requests</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe your API service" {...field} />
                                    </FormControl>
                                    <FormDescription>Provide a brief description of your API service
                                        (optional)</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="baseUrl"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Base URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://api.example.com" {...field} />
                                    </FormControl>
                                    <FormDescription>Enter the base URL for your API service</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="enableAuth"
                            render={({field}) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Enable API Auth</FormLabel>
                                        <FormDescription>Turn on authentication for your API service</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange}/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {enableAuth && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="authType"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Auth Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value!}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select auth type"/>
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="api_key">API Key</SelectItem>
                                                    <SelectItem value="token">Token</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Choose the authentication type for your
                                                API</FormDescription>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                {authType === "api_key" && (
                                    <>
                                        <FormField
                                            control={form.control}
                                            name="apiKey"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>API Key</FormLabel>
                                                    <FormControl>
                                                        <Input type="password"
                                                               placeholder="Enter your API key" {...field}
                                                               value={field.value as string}/>
                                                    </FormControl>
                                                    <FormDescription>Provide the API key for
                                                        authentication</FormDescription>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="apiKeyLocation"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>API Key Location</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value!}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select API key location"/>
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="query">Query Parameter</SelectItem>
                                                            <SelectItem value="header">Headers</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>Choose where to include the API
                                                        key</FormDescription>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        {apiKeyLocation === "header" && (
                                            <FormField
                                                control={form.control}
                                                name="headerName"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Header Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="X-API-Key" {...field}
                                                                   value={field.value as string}/>
                                                        </FormControl>
                                                        <FormDescription>Enter the name of the header for the API
                                                            key</FormDescription>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                        {apiKeyLocation === "query" && (
                                            <FormField
                                                control={form.control}
                                                name="queryParamName"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Query Parameter Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="api_key" {...field}
                                                                   value={field.value as string}/>
                                                        </FormControl>
                                                        <FormDescription>Enter the name of the query parameter for the
                                                            API key</FormDescription>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                    </>
                                )}
                                {authType === "token" && (
                                    <FormField
                                        control={form.control}
                                        name="token"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Token</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="Enter your token" {...field}
                                                           value={field.value as string}/>
                                                </FormControl>
                                                <FormDescription>
                                                    Provide the token for authentication. It will be sent in
                                                    the &quot;Authorization&quot; header
                                                    with &quot;Bearer&quot; prefix.
                                                </FormDescription>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </>
                        )}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="min-w-[120px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                                </>
                            ) : (
                                mode === 'create' ? 'Create API Service' : 'Update API Service'
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

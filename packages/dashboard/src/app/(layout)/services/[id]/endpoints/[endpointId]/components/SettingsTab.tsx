"use client";

import {Fragment, useEffect, useState} from "react";
import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Switch} from "@/components/ui/switch";
import {VerticalMenuTabs} from "@/components/ui/vertical-menu-tabs";
import {createClient} from '@/utils/supabase/client';
import {Loader2} from 'lucide-react';
import {Tables} from '@/utils/supabase/database.types';
import {toast} from "sonner";
import CodeEditor from '@/components/ui/code-editor';
import DeleteEndpointForm from './DeleteEndpointForm';
import haveSameRouteParams from '@/utils/haveSameRouteParams';
import {endpointSchema} from "@/utils/validation/endpointsSchema";

const methods = [
    {id: "GET", name: "GET"},
    {id: "POST", name: "POST"},
    {id: "PUT", name: "PUT"},
    {id: "DELETE", name: "DELETE"},
] as const;

interface Props {
    endpoint: Tables<'endpoints'>;
    service: Tables<'services'>;
}

const RedDot = () => (
    <span className="w-2 h-2 bg-red-400 rounded-full ml-2"></span>
);

export default function Settings({endpoint, service}: Props) {

    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof endpointSchema>>({
        resolver: zodResolver(endpointSchema),
        defaultValues: {
            name: endpoint.name ?? "",
            path: endpoint.full_url.replace(service.base_url, ''),
            method: endpoint.method as "GET" ?? "GET",
            caching: endpoint.cache_enabled ?? true,
            cache_ttl_s: (endpoint.cache_ttl_s ?? 60).toString(),
            retryEnabled: endpoint.retry_enabled ?? false,
            maxRetries: (endpoint.retry_count ?? 3).toString(),
            retryInterval: (endpoint.retry_interval_s ?? 10).toString(),
            fallback_response_enabled: endpoint.fallback_response_enabled ?? false,
            fallbackResponse: JSON.stringify(endpoint.fallback_response) ?? '{"error": "Unavailable"}',
            fallbackStatusCode: (endpoint.fallback_status_code ?? 500).toString(),
            transformationCode: endpoint.data_mapping_function ?? `function transform(data) {
    return data
}`,
            transformationPrompt: "",
            transformationEnabled: endpoint.data_mapping_enabled ?? false,
            mockData: JSON.stringify(endpoint.mock_response, null, 2) ?? '{"message": "Hello, World!"}',
            mockEnabled: endpoint.mock_enabled ?? false,
            mockStatusCode: (endpoint.mock_status_code ?? 200).toString(),
            customHeadersEnabled: endpoint.custom_headers_enabled ?? false,
            customHeaders: JSON.stringify(endpoint.custom_headers, null, 2) ?? '{"Cache-Control": "no-cache"}'
        },
    });

    const {control, formState: {errors}} = form;

    const name = useWatch({control, name: "name"});
    const path = useWatch({control, name: "path"});
    const method = useWatch({control, name: "method"});
    const caching = useWatch({control, name: "caching"});
    const retryEnabled = useWatch({control, name: "retryEnabled"});
    const transformationEnabled = useWatch({control, name: "transformationEnabled"});
    const mockEnabled = useWatch({control, name: "mockEnabled"});
    const fallbackResponseEnabled = useWatch({control, name: "fallback_response_enabled"});
    const customHeadersEnabled = useWatch({control, name: "customHeadersEnabled"});

    const [steps, setSteps] = useState([
        {id: "general", name: "General", visible: true},
        {id: "caching", name: "Caching", visible: method === "GET"},
        {id: "retry", name: "Retry Policy", visible: true},
        {id: "customHeaders", name: "Custom headers", visible: true},
        {id: "transformation", name: "Transformation", visible: true},
        {id: "mocking", name: "Mocking", visible: true},
        {id: "fallback", name: "Fallback", visible: true},
    ]);

    useEffect(() => {
        const updatedSteps = steps.map((step) => {
            if (step.id === "caching") {
                return {...step, visible: method === "GET"};
            }
            return step;
        });

        setSteps(updatedSteps);
    }, [method]);

    const onSubmit = async (data: z.infer<typeof endpointSchema>) => {
        if (!haveSameRouteParams(name, path)) {
            toast.error("Path and Alias route params count and/or name does not match")
            return;
        }

        const existingEndpoint = await createClient()
            .from('endpoints')
            .select('*')
            .eq('service_id', endpoint.service_id)
            .eq('name', data.name)
            .eq('method', data.method)
            .maybeSingle();

        if (existingEndpoint.data && existingEndpoint.data.id !== endpoint.id) {
            toast.error(`Endpoint [${data.method}] ${data.name} already exists`)
            return
        }

        setIsSubmitting(true);
        await fetch(`/api/endpoints?id=${endpoint.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                endpointId: endpoint.id,
                oldName: endpoint.name,
                name: data.name,
                fullUrl: service.base_url + data.path,
                method: data.method,
                cacheEnabled: data.caching,
                cacheTtlS: data.cache_ttl_s ? data.cache_ttl_s : 0,
                retryEnabled: data.retryEnabled,
                retryCount: data.maxRetries ? data.maxRetries : 0,
                retryInterval: data.retryInterval ? data.retryInterval : 0,
                fallbackResponseEnabled: data.fallback_response_enabled,
                fallbackResponse: JSON.parse(data.fallbackResponse ?? ''),
                fallbackStatusCode: data.fallbackStatusCode ? data.fallbackStatusCode : 0,
                dataMappingFunction: data.transformationCode,
                dataMappingEnabled: data.transformationEnabled,
                mockEnabled: data.mockEnabled,
                mockResponse: JSON.parse(data.mockData ?? ''),
                mockStatusCode: data.mockStatusCode ? data.mockStatusCode : 0,
                regexPath: '^' + data.name.replace(/{[^}]+}/g, '([^/]+)') + '$',
                serviceName: service.name,
                userId: service.user_id,
                customHeadersEnabled: data.customHeadersEnabled,
                customHeaders: JSON.parse(data.customHeaders ?? ''),
            })
        })
            .then(response => response.json())
            .then(() => toast.success('Endpoint updated successfully'))
            .catch(error => toast.error('Failed to update endpoint', {description: error.message}))
            .finally(() => setIsSubmitting(false));
    };

    const renderStepContent = (stepId: string) => {
        switch (stepId) {
            case "general":
                return (<Fragment key={1}>
                        <FormField
                            control={control}
                            name="path"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>URL</FormLabel>
                                    <FormControl>
                                        <div className='flex items-center gap-2'>
                                            <FormField
                                                control={control}
                                                name="method"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Select onValueChange={field.onChange}
                                                                    defaultValue={field.value}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select method"/>
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {methods.map((method) => (
                                                                        <SelectItem key={method.id} value={method.id}>
                                                                            {method.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />
                                            <pre className="p-2 bg-gray-100 rounded-md font-mono text-sm">
                                            <code>{service.base_url}</code>
                                        </pre>
                                            <Input placeholder="Enter path" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Upstream url that should be called. You can add route params here.
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Endpoint alias template</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter alias name" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Define alias for your endpoint. It will be used for accesing
                                        API200.
                                        <br/>
                                        You can also leave it same as URL.
                                        Example with params:
                                        <br/>
                                        <strong>Path:</strong> <code>{`/profile/posts/{id}/comments`}</code>
                                        <br/>
                                        <strong>Alias:</strong> <code>{`/profile-comments/{id}`}</code>
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <DeleteEndpointForm service={service} endpoint={endpoint}/>
                    </Fragment>
                );
            case "caching":
                return (
                    <Fragment key={3}>
                        <FormField
                            control={control}
                            name="caching"
                            render={({field}) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Enable Caching</FormLabel>
                                        <FormDescription>Cache responses to improve performance</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange}/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {caching && (
                            <FormField
                                control={control}
                                name="cache_ttl_s"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Cache TTL (s)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Enter cache TTL" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        )}
                    </Fragment>
                );
            case "retry":
                return (
                    <Fragment key={4}>
                        <FormField
                            control={control}
                            name="retryEnabled"
                            render={({field}) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Enable Retries</FormLabel>
                                        <FormDescription>Retry failed requests</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange}/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {retryEnabled && (
                            <>
                                <FormField
                                    control={control}
                                    name="maxRetries"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Max Retries</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Enter max retries" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="retryInterval"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Retry Interval (s)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Enter retry interval" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}
                    </Fragment>
                );
            case "customHeaders":
                return (
                    <Fragment key={"customHeaders"}>
                        <FormField
                            control={control}
                            name="customHeadersEnabled"
                            render={({field}) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Enable Custom Headers</FormLabel>
                                        <FormDescription>Attach headers to each request</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange}/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {customHeadersEnabled && (
                            <FormField
                                control={control}
                                name="customHeaders"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Custom Headers</FormLabel>
                                        <FormControl>
                                            <CodeEditor
                                                value={field.value}
                                                onChange={field.onChange}
                                                language="json"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Provide headers in JSON format
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        )}
                    </Fragment>
                )
            case "transformation":
                return (
                    <Fragment key={5}>
                        <FormField
                            control={control}
                            name="transformationEnabled"
                            render={({field}) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Enable Transformation</FormLabel>
                                        <FormDescription>Modify API responses using JavaScript</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange}/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {transformationEnabled && (
                            <FormField
                                control={control}
                                name="transformationCode"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Transformation Code</FormLabel>
                                        <FormControl className="overflow-hidden">
                                            <CodeEditor
                                                value={field.value}
                                                onChange={field.onChange}
                                                language="javascript"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Provide the <code>transform(data)</code> function to modify the response
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        )}
                    </Fragment>
                );
            case "mocking":
                return (
                    <Fragment key={6}>
                        <FormField
                            control={control}
                            name="mockEnabled"
                            render={({field}) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Enable Mocking</FormLabel>
                                        <FormDescription>Simulate API responses for testing</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange}/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {mockEnabled && (
                            <>
                                <FormField
                                    control={control}
                                    name="mockData"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Mock Data</FormLabel>
                                            <FormControl>
                                                <CodeEditor
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    language="json"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Provide the mock response data in JSON format
                                            </FormDescription>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="mockStatusCode"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Mock Status Code</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Enter mock status code" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}
                    </Fragment>
                );
            case "fallback":
                return (
                    <Fragment key={7}>
                        <FormField
                            control={control}
                            name="fallback_response_enabled"
                            render={({field}) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Enable Fallback</FormLabel>
                                        <FormDescription>Return a fallback response when the API is
                                            unavailable</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange}/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {fallbackResponseEnabled && (
                            <>
                                <FormField
                                    control={control}
                                    name="fallbackResponse"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Fallback Response</FormLabel>
                                            <FormControl>
                                                <CodeEditor
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    language="json"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Provide the fallback response data in JSON format
                                            </FormDescription>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="fallbackStatusCode"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Fallback Status Code</FormLabel>
                                            <FormControl>
                                                <Input type="number"
                                                       placeholder="Enter fallback status code" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}
                    </Fragment>
                );
            default:
                return null;
        }
    };

    const menuItems = steps
        .filter((step) => step.visible)
        .map((step) => {
            const hasErrors = Object.keys(errors).some((errorKey) => {
                const stepFields = {
                    general: ["name", "endpoint", "method"],
                    caching: ["caching", "cache_ttl_s"],
                    retry: ["retryEnabled", "maxRetries", "retryInterval"],
                    transformation: ["transformationEnabled", "transformationCode", "transformationPrompt"],
                    mocking: ["mockEnabled", "mockData", "mockStatusCode"],
                    fallback: ["fallback_response_enabled", "fallbackResponse", "fallbackStatusCode"],
                    customHeaders: ["customHeadersEnabled", "customHeaders"],
                };

                return stepFields[step.id as keyof typeof stepFields]?.includes(errorKey);
            });

            return {
                label: (
                    <div className="flex items-center">
                        {step.name}
                        {hasErrors && <RedDot/>}
                    </div>
                ),
                value: step.id,
                content: (
                    <Form {...form}>
                        <form className="space-y-4">
                            {renderStepContent(step.id)}
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="min-w-[120px]"
                                onClick={form.handleSubmit(onSubmit)}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </form>
                    </Form>
                ),
            };
        });

    return (
        <div className="container mx-auto p-0 lg:w-5/6">
            <Card className="border-none shadow-none">
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Configure your API endpoint settings</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg overflow-hidden">
                        <VerticalMenuTabs items={menuItems}/>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

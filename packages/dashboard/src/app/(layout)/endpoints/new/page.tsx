"use client";

import { BaseSyntheticEvent, Fragment, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../../../components/ui/form";
import { Input } from "../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Switch } from "../../../../components/ui/switch";
import { createClient } from '../../../../utils/supabase/client';
import { ChevronRight, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "../../../../components/ui/breadcrumb";
import CodeEditor from '../../../../components/ui/code-editor';
import haveSameRouteParams from '../../../../utils/haveSameRouteParams';
import {endpointSchema} from "../../../../utils/validation/endpointsSchema";

const methods = [
    { id: "GET", name: "GET" },
    { id: "POST", name: "POST" },
    { id: "PUT", name: "PUT" },
    { id: "DELETE", name: "DELETE" },
] as const;

export default function AddApi() {
    const params = useSearchParams();
    const router = useRouter();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const [steps, setSteps] = useState([
        { id: "general", name: "General" },
        { id: "caching", name: "Caching", visible: true },
        { id: "retry", name: "Retry Policy" },
        { id: "transformation", name: "Data mapping" },
        { id: "mocking", name: "Response mocking" },
        { id: "fallback", name: "Fallback response" },
    ]);

    const form = useForm<z.infer<typeof endpointSchema>>({
        resolver: zodResolver(endpointSchema),
        defaultValues: {
            name: '/',
            path: '/',
            method: "GET",
            caching: true,
            cache_ttl_s: '60',
            retryEnabled: false,
            maxRetries: '3',
            retryInterval: '10',
            fallback_response_enabled: false,
            fallbackResponse: '{"error": "Unavailable"}',
            fallbackStatusCode: '500',
            transformationCode: "function transform(data) { return data; }",
            transformationPrompt: "",
            transformationEnabled: false,
            mockData: '{"message": "Hello, World!"}',
            mockEnabled: false,
            mockStatusCode: '200',
        },
    });

    const { watch, control, setValue } = form;

    const name = watch("name");
    const path = watch("path");
    const method = watch("method");
    const caching = watch("caching");
    const retryEnabled = watch("retryEnabled");
    const transformationEnabled = watch("transformationEnabled");
    const mockEnabled = watch("mockEnabled");
    const fallbackResponseEnabled = watch("fallback_response_enabled");

    const visibleSteps = steps.filter((step) => step.visible !== false);

    useEffect(() => {
        if (currentStep >= visibleSteps.length) {
            setCurrentStep(visibleSteps.length - 1);
        }
    }, [visibleSteps, currentStep]);

    useEffect(() => {
        const updatedSteps = steps.map((step) => {
            if (step.id === "caching") {
                return { ...step, visible: method === "GET" };
            }
            return step;
        });

        setSteps(updatedSteps);
    }, [method]);

    const [isNameTouched, setIsNameTouched] = useState(false);

    useEffect(() => {
        if (!isNameTouched) {
            setValue("name", path);
        }
    }, [path, isNameTouched, setValue]);

    const onSubmit = async (data: z.infer<typeof endpointSchema>) => {
        const existingEndpoint = await createClient()
            .from('endpoints')
            .select('*')
            .eq('service_id', params.get('service_id'))
            .eq('name', data.path)
            .eq('method', data.method)
            .maybeSingle();

        if (existingEndpoint.data) {
            toast.error(`Endpoint [${data.method}] ${data.path} already exists`);
            return;
        }

        setIsSubmitting(true);
        fetch('/api/endpoints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: data.name,
                fullUrl: params.get('base_url') + data.path,
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
                serviceId: params.get('service_id'),
                serviceName: params.get('service_name'),
                userId: params.get('user_id'),
                regexPath: '^' + data.name.replace(/{[^}]+}/g, '([^/]+)') + '$'
            }
            )
        })
            .then(response => response.json())
            .then(res => {
                const data = res.data;
                toast.success("Endpoint created successfully.");
                router.push(`/services/${data.service_id}/endpoints/${data.id}`);
            })
            .catch(error => toast.error('Something went wrong.', { description: error?.message }))
            .finally(() => setIsSubmitting(false));
    };

    const nextStep = (e: BaseSyntheticEvent) => {
        e.preventDefault();
        form.trigger().then((isValid) => {
            if (isValid) {
                if (!haveSameRouteParams(name, path)) {
                    toast.error("Path and Alias route params count and/or name do not match")
                    return;
                }

                setCurrentStep((prev) => Math.min(prev + 1, visibleSteps.length - 1));
            }
        });
    };

    const prevStep = (e: BaseSyntheticEvent) => {
        e.preventDefault();
        form.trigger().then((isValid) => {
            if (isValid) {
                setCurrentStep((prev) => Math.max(prev - 1, 0));
            }
        });
    };

    const renderStepContent = () => {
        const currentStepId = visibleSteps[currentStep]?.id;

        switch (currentStepId) {
            case "general":
                return (
                    <Fragment key={1}>
                        <FormField
                            control={control}
                            name="path"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Endpoint URL</FormLabel>
                                    <FormControl>
                                        <div className='flex items-center gap-2'>
                                            <FormField
                                                control={control}
                                                name="method"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Select onValueChange={field.onChange}
                                                                defaultValue={field.value}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select method" />
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
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <pre className="p-2 bg-gray-100 rounded-md font-mono text-sm">
                                                <code>{params.get('base_url')}</code>
                                            </pre>
                                            <Input placeholder="Enter path" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Upstream url that should be called. You can add route params here.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Endpoint alias name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter alias" {...field}
                                            onFocus={() => setIsNameTouched(true)}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Define alias for your endpoint. It will be used for accesing
                                        API200.
                                        <br />
                                        You can also leave it same as URL.
                                        Example with params:
                                        <br />
                                        <strong>Path:</strong> <code>{`/profile/posts/{id}/comments`}</code>
                                        <br />
                                        <strong>Alias:</strong> <code>{`/profile-comments/{id}`}</code>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </Fragment>
                );
            case "caching":
                return (
                    <Fragment key={3}>
                        <FormField
                            control={control}
                            name="caching"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Enable Caching</FormLabel>
                                        <FormDescription>Cache responses to improve performance</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {caching && (
                            <FormField
                                control={control}
                                name="cache_ttl_s"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cache TTL (s)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Enter cache TTL" {...field} />
                                        </FormControl>
                                        <FormMessage />
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
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Enable Retries</FormLabel>
                                        <FormDescription>Retry request on error</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {retryEnabled && (
                            <>
                                <FormField
                                    control={control}
                                    name="maxRetries"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Retries</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Enter max retries" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="retryInterval"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Retry Interval (s)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Enter retry interval" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}
                    </Fragment>
                );
            case "transformation":
                return (
                    <Fragment key={5}>
                        <FormField
                            control={control}
                            name="transformationEnabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Enable Data Mapping</FormLabel>
                                        <FormDescription>Modify API responses using JavaScript</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {transformationEnabled && (
                            <FormField
                                control={control}
                                name="transformationCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data Mapping Code</FormLabel>
                                        <FormControl>
                                            <CodeEditor
                                                value={field.value}
                                                onChange={field.onChange}
                                                language="javascript"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Provide the <code>transform(data)</code> function to modify the response
                                        </FormDescription>
                                        <FormMessage />
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
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Enable Response Mocking</FormLabel>
                                        <FormDescription>Simulate API responses for testing</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {mockEnabled && (
                            <>
                                <FormField
                                    control={control}
                                    name="mockData"
                                    render={({ field }) => (
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="mockStatusCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mock Status Code</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Enter mock status code" {...field} />
                                            </FormControl>
                                            <FormMessage />
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
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Enable Fallback Response</FormLabel>
                                        <FormDescription>Return a fallback response when the API is
                                            unavailable</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {fallbackResponseEnabled && (
                            <>
                                <FormField
                                    control={control}
                                    name="fallbackResponse"
                                    render={({ field }) => (
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="fallbackStatusCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fallback Status Code</FormLabel>
                                            <FormControl>
                                                <Input type="number"
                                                    placeholder="Enter fallback status code" {...field} />
                                            </FormControl>
                                            <FormMessage />
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
    return (
        <div className="container mx-auto">
            <div className="w-full lg:w-2/3 mx-auto">
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/services">Endpoints</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator>
                            <ChevronRight className="h-4 w-4" />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbPage>New</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <Card>
                    <CardHeader>
                        <CardTitle>Add API Endpoint</CardTitle>
                        <CardDescription>Add an Endpoint to your Service</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form className="space-y-4">
                                <div className="flex mb-4">
                                    {visibleSteps.map((step, index) => (
                                        <div key={step.id} className="flex-1 relative">
                                            <div className="h-2 bg-gray-200 absolute top-0 left-0 w-full"></div>
                                            <div
                                                className={`
                                                h-2 bg-primary absolute top-0 left-0 transition-all duration-500 ease-in-out 
                                                ${index === 0 ? 'rounded-l' : ''}
                                                ${index === visibleSteps.length - 1 ? 'rounded-r' : ''}
                                                ${index <= currentStep ? "w-full" : "w-0"
                                                    }`}
                                            ></div>
                                            <div className="text-xs mt-3">{step.name}</div>
                                        </div>
                                    ))}
                                </div>
                                {renderStepContent()}
                                <div className="flex justify-start gap-3">
                                    {currentStep > 0 && <Button variant="outline" onClick={prevStep}>Previous</Button>}
                                    {currentStep < visibleSteps.length - 1 ? (
                                        <Button type="submit" onClick={nextStep}>Next</Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="min-w-[120px]"
                                            onClick={form.handleSubmit(onSubmit)}
                                        >
                                            {
                                                isSubmitting
                                                    ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Creating...
                                                        </>)
                                                    : 'Add Endpoint'
                                            }
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

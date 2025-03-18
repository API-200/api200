"use client"

import {useRouter, useSearchParams} from "next/navigation"
import Link from "next/link"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {createClient} from "../../../utils/supabase/client"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "../../../components/ui/card"
import {Input} from "../../../components/ui/input"
import {Button} from "../../../components/ui/button"
import {Separator} from "../../../components/ui/separator"
import {Alert, AlertDescription, AlertTitle} from "../../../components/ui/alert"
import {AlertCircle, Mail} from "lucide-react"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "../../../components/ui/form"
import FEATURES from "../../../config/features";

// Form validation schema
const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const errorMessage = searchParams.get("message")
    const supabase = createClient()

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const {error} = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })

            if (error) {
                router.push(`/login?message=${error.message}`)
                return
            }

            router.push("/")
        } catch (error) {
            console.error("Login error:", error)
            router.push("/login?message=An unexpected error occurred")
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            const {data, error} = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/confirm`,
                },
            })

            if (error) {
                router.push(`/login?message=${error.message}`)
                return
            }

            if (data.url) {
                router.push(data.url)
            }
        } catch (error) {
            console.error("Google sign in error:", error)
            router.push("/login?message=An unexpected error occurred")
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Enter your credentials to access your account.</CardDescription>
                    {errorMessage && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4"/>
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                    )}
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent>
                            <div className="grid w-full items-center gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your email" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Enter your password" {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col">
                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Logging in..." : "Login"}
                            </Button>
                            {FEATURES.AUTH.ENABLE_GOOGLE_AUTH && (
                                <>
                                    <Separator className="my-4"/>
                                    <Button
                                        onClick={handleGoogleSignIn}
                                        variant="outline"
                                        className="w-full"
                                        type="button"
                                        disabled={form.formState.isSubmitting}
                                    >
                                        <Mail className="mr-2 h-4 w-4"/>
                                        Login with Google
                                    </Button>
                                </>)}
                            <p className="mt-4 text-sm text-center">
                                Don&#39;t have an account?{" "}
                                <Link href="/signup" className="text-blue-600 hover:underline">
                                    Sign up
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    )
}

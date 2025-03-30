"use client"

import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import FEATURES from "@/config/features";

// Form validation schema
const signUpSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        ),
})

type SignUpFormValues = z.infer<typeof signUpSchema>

export default function SignUpPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const errorMessage = searchParams.get("message")
    const supabase = createClient()

    const form = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (data: SignUpFormValues) => {
        try {
            const { error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
            })

            if (error) {
                router.push(`/signup?message=${error.message}`)
                return
            }

            router.push("/")
        } catch (error) {
            console.error("Sign up error:", error)
            router.push("/signup?message=An unexpected error occurred")
        }
    }

    const handleGoogleSignUp = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/confirm`,
                },
            })

            if (error) {
                router.push(`/signup?message=${error.message}`)
                return
            }

            if (data.url) {
                router.push(data.url)
            }
        } catch (error) {
            console.error("Google sign up error:", error)
            router.push("/signup?message=An unexpected error occurred")
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Sign Up</CardTitle>
                    <CardDescription>Create a new account to get started.</CardDescription>
                    {errorMessage && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
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
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Create a password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col">
                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Signing up..." : "Sign Up"}
                            </Button>
                            {FEATURES.AUTH.ENABLE_GOOGLE_AUTH && (<>
                                <Separator className="my-4" />
                                <Button
                                    onClick={handleGoogleSignUp}
                                    variant="outline"
                                    className="w-full"
                                    type="button"
                                    disabled={form.formState.isSubmitting}
                                >
                                    Sign up with Google
                                </Button>
                            </>)}
                            <p className="mt-4 text-sm text-center">
                                Already have an account?{" "}
                                <Link href="/login" className="text-blue-600 hover:underline">
                                    Login
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    )
}


import type { Metadata } from "next";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import { PublicEnvScript } from 'next-runtime-env';


export const metadata: Metadata = {
    title: "API200 - Dashboard",
    description: "3d party APIs integration made easy. Auth, caching, logging & monitoring, data mapping, retries, mocking, fallback and more...",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <PublicEnvScript />
            </head>
            <body>
                <Analytics />
                <NextTopLoader />
                <Suspense>
                    {children}
                </Suspense>
                <Toaster />
            </body>
        </html>
    );
}

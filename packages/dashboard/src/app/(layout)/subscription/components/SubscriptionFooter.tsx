import Link from "next/link"

import { cn } from "@/lib/utils"

export function SubscriptionFooter({ className }: { className?: string }) {
    return (
        <footer className={cn(" border-t pt-6", className)}>
            <div className="container mx-auto">
                <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                    <Link
                        href="https://api200.co/terms-of-service"
                        className="transition-colors hover:text-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Terms of service
                    </Link>
                    <Link
                        href="https://api200.co/privacy-policy"
                        className="transition-colors hover:text-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Privacy policy
                    </Link>
                    <Link
                        href="https://api200.co/refund-policy"
                        className="transition-colors hover:text-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Refund policy
                    </Link>
                </div>
            </div>
        </footer>
    )
}

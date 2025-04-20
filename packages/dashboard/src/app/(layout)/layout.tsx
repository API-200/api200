import { AppSidebar } from "@/app/(layout)/components/AppSidebar"
import { SidebarProvider } from '@/components/ui/sidebar'
import { redirect } from 'next/navigation'
import {createClient} from "@/utils/supabase/server";
import OnboardingModal from "@/app/(layout)/components/OnboardingModal";

export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full">
                <AppSidebar />
                <OnboardingModal/>
                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </div>
        </SidebarProvider>
    )
}


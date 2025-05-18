"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {AlertCircleIcon, Book, CreditCard, Globe, KeyRound, Layers} from 'lucide-react'
import Image from "next/image"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { UsageProgressBar } from "./UsageProgressBar"
import { UserSection } from "./UserSection"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { GiveFeedbackLink } from "./GiveFeedbackLink"
import FEATURES from "@/config/features"
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function AppSidebar() {
    const pathname = usePathname()
    const [incidentsCount, setIncidentsCount] = useState(0)

    const isActive = (href: string) => {
        if (href === "/services") {
            return pathname === "/services" || pathname.startsWith("/services/")
        }
        return pathname === href
    }

    const supabase = createClient();

    useEffect(() => void async function () {
        const { data: incidentsData, error: incidentsError } = await supabase
            .from("incidents")
            .select('count', { count: 'exact' })
            .eq("resolved", false)
            .single()

        console.log({ incidentsData, incidentsError })

        if (incidentsData) {
            setIncidentsCount(incidentsData.count || 0)
        }
    }(), [])

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarGroup>
                    <div className="flex items-center gap-2">
                        <Image src={'/images/icon.png'} alt={'app icon'} width={32} height={32} />
                        <div className="text-md font-semibold text-gray-900">
                            API <span>200</span>
                        </div>
                    </div>
                </SidebarGroup>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/services")}>
                                    <Link href="/services">
                                        <Layers className="mr-2 h-4 w-4" />
                                        Services
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/incidents")}>
                                    <Link href="/incidents">
                                        <AlertCircleIcon className="mr-2 h-4 w-4" />
                                        Incidents
                                        {
                                            (incidentsCount > 0) &&
                                            <div className="rounded-sm border border-red-400 text-red-400"><span className="p-2">{incidentsCount}</span></div>
                                        }

                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/specification")}>
                                    <Link href="/specification">
                                        <Book className="mr-2 h-4 w-4" />
                                        Swagger specification
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/credentials")}>
                                    <Link href="/credentials">
                                        <KeyRound className="mr-2 h-4 w-4" />
                                        Credentials
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            {FEATURES.SIDEBAR.SHOW_USAGE &&  <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive("/subscription")}>
                                    <Link href="/subscription">
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Subscription
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>}

                            <GiveFeedbackLink />
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="space-y-1">
                {FEATURES.SIDEBAR.SHOW_USAGE && <UsageProgressBar />}
                {FEATURES.SIDEBAR.SHOW_REGION && <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-left bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md">
                            <span className="flex items-center">
                                <Globe className="mr-2 h-4 w-4" />
                                Region: EU (Europe)
                            </span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuItem disabled>
                            Support for other regions coming soon
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                }
                <UserSection />
            </SidebarFooter>
        </Sidebar>
    )
}

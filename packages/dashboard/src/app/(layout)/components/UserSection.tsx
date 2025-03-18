"use client"

import {Avatar, AvatarFallback, AvatarImage} from "../../../components/ui/avatar"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "../../../components/ui/dropdown-menu"
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem} from "../../../components/ui/sidebar"
import {ChevronUp, LogOut} from "lucide-react"
import {Skeleton} from "../../../components/ui/skeleton"
import {useUserClient} from "../../../hooks/useUserClient"

export function UserSection() {
    const {user, loading, handleLogout} = useUserClient()

    if (loading) {
        return (
            <Skeleton className="h-8 mx-2 w-full"/>
        )
    }

    if (!user) return null

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton className="w-full justify-between">
                            <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user.email}/>
                                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                {user.email}
                            </div>
                            <ChevronUp className="h-4 w-4"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                        <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4"/>
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

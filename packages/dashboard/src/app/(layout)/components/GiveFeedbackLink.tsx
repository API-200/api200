import { MessageSquare } from 'lucide-react';
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export function GiveFeedbackLink() {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-white">
                <a
                    className="w-full"
                    target="_blank"
                    href="https://github.com/API-200/api200/discussions/categories/q-a"
                >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Get Support
                </a>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

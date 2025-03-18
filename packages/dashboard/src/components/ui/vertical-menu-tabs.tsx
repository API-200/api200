"use client";

import * as React from "react";
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { Tabs, TabsContent } from "@/components/ui/tabs";

interface MenuItem {
    label: string | React.ReactNode;
    value: string;
    content: React.ReactNode;
}

interface VerticalMenuTabsProps {
    items: MenuItem[];
}

export function VerticalMenuTabs({ items }: VerticalMenuTabsProps) {
    const [activeTab, setActiveTab] = React.useState(items[0]?.value || "");

    return (
        <div className="flex gap-3">
            {/* Vertical Menu */}
            <Menubar className="flex-col h-full items-center pr-5 border-t-0 border-l-0 border-b-0 border-r-1 shadow-none rounded-none">
                {items.map((item) => (
                    <MenubarMenu key={item.value}>
                        <MenubarTrigger
                            className={`w-full m-1 justify-start cursor-pointer ${activeTab === item.value ? "bg-accent" : ""}`}
                            onClick={() => setActiveTab(item.value)}
                        >
                            {item.label}
                        </MenubarTrigger>
                    </MenubarMenu>
                ))}
            </Menubar>

            {/* Tabs Content */}
            <Tabs value={activeTab} className="flex-1">
                {items.map((item) => (
                    <TabsContent key={item.value} value={item.value} className="p-4">
                        {item.content}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
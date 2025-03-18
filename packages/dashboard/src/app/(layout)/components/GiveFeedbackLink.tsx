import {useEffect} from 'react';
import {MessageSquare} from 'lucide-react';
import Script from 'next/script';
import {SidebarMenuButton, SidebarMenuItem} from "../../../components/ui/sidebar";
import {useUserClient} from "../../../hooks/useUserClient";
import FEATURES from "../../../config/features";

declare global {
    interface Window {
        Canny: {
            (command: string, options: any): void;
            q?: any[];
        };
    }
}

export function GiveFeedbackLink() {
    const {user} = useUserClient()


    useEffect(() => {
        if(!FEATURES.ANALYTICS.ENABLE_CANNY){
            return
        }

        if (user) {
            window.Canny?.('identify', {
                appID: '67bb830551e0a8fecd8c7b5e',
                user: {
                    email: user.email ?? '',
                    name: user.user_metadata?.full_name || user.email || '',
                    id: user.id,
                    avatarURL: user.user_metadata?.avatar_url,
                    created: user.created_at ? new Date(user.created_at).toISOString() : undefined,
                },
            });
        }
    }, [user]);

    return (
        <SidebarMenuItem>
            {/* Load Canny script once */}
            {FEATURES.ANALYTICS.ENABLE_CANNY && <Script
                id="canny-sdk"
                strategy="lazyOnload"
                dangerouslySetInnerHTML={{
                    __html: `
            !function(w,d,i,s){function l(){if(!d.getElementById(i)){var f=d.getElementsByTagName(s)[0],e=d.createElement(s);e.type="text/javascript",e.async=!0,e.src="https://canny.io/sdk.js",f.parentNode.insertBefore(e,f)}}if("function"!=typeof w.Canny){var c=function(){c.q.push(arguments)};c.q=[],w.Canny=c,"complete"===d.readyState?l():w.attachEvent?w.attachEvent("onload",l):w.addEventListener("load",l,!1)}}(window,document,"canny-jssdk","script");
          `,
                }}
            />}

            <SidebarMenuButton asChild
                               className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-white">
                <a
                    className="w-full"
                    data-canny-link
                    href="https://api200.canny.io/feature-requests"
                >
                    <MessageSquare className="mr-2 h-4 w-4"/>
                    Give Feedback
                </a>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

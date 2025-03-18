import { type EmailOtpType } from '@supabase/supabase-js'
import {NextResponse, type NextRequest } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = searchParams.get('next') ?? '/'
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const supabase = await createClient()

    if (code) {
        await supabase.auth.exchangeCodeForSession(code)
        return NextResponse.redirect(requestUrl.origin)
    }

    if (token_hash && type) {

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })
        if (!error) {
            // redirect user to specified redirect URL or root of app
            redirect(next)
        }
    }

    // redirect the user to an error page with some instructions
    redirect('/error')
}

'use client' // This tells Next.js this file handles clicks

import { createBrowserClient } from '@supabase/ssr'

export default function LoginButton() {
    // We initialize the Supabase client for the browser
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // This tells Google where to send the user after they log in
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
    }

    return (
        <button
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
            Sign in with Google
        </button>
    )
}
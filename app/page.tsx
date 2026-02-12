import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import LoginButton from '@/components/LoginButton'

export default async function Home() {
    const cookieStore = await cookies()

    // 1. Create the Supabase client to check if the user is logged in
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    // 2. Ask Supabase: "Who is this user?"
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <main className="p-10 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6">My Gated App</h1>

            {!user ? (
                // CASE A: User is NOT logged in. Show the "Gated" message and the button.
                <div className="text-center">
                    <p className="mb-4 text-red-500">Access Denied. Please sign in to view data.</p>
                    <LoginButton />
                </div>
            ) : (
                // CASE B: User IS logged in. Show the private data.
                <div className="w-full max-w-md">
                    <div className="bg-green-100 p-4 rounded mb-6 text-center">
                        <p className="text-green-800 font-semibold">Welcome, {user.email}!</p>
                    </div>

                    <h2 className="text-xl font-bold mb-2">Protected Database Records:</h2>
                    {/* You can paste your <ul> list code from last week here */}
                    <p className="italic text-gray-600">You are now seeing the gated UI.</p>
                </div>
            )}
        </main>
    )
}
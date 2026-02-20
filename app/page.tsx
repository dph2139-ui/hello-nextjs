import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import LoginButton from '@/components/LoginButton'
import RateButton from '@/components/RateButton'

export default async function Home() {
    const cookieStore = await cookies()

    // 1. Initialize Supabase Server Client
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

    // 2. Check if the user is authenticated
    const { data: { user } } = await supabase.auth.getUser()

    // 3. If logged in, fetch the data from your table
    let dataRecords: any[] = []
    if (user) {
        // Replace 'posts' with your actual table name if it's different
        const { data } = await supabase.from('sidechat_posts').select('*')
        dataRecords = data || []
    }

    return (
        <main className="p-10 flex flex-col items-center min-h-screen bg-gray-50">
            <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
                    Assignment #3: Gated UI
                </h1>

                {!user ? (
                    /* --- CASE A: GATED (Logged Out) --- */
                    <div className="text-center py-10">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                            <p className="font-bold">Access Restricted</p>
                            <p className="text-sm">You must be logged in with Google to view the database.</p>
                        </div>
                        <LoginButton />
                    </div>
                ) : (
                    /* --- CASE B: AUTHORIZED (Logged In) --- */
                    <div>
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-8 flex justify-between items-center">
              <span>
                <strong>Success!</strong> Logged in as: {user.email}
              </span>
                            {/* Optional: Simple Sign Out Link */}
                            <a href="/" className="text-xs underline text-green-900">Refresh</a>
                        </div>

                        <h2 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">
                            Protected Database Data:
                        </h2>

                        {dataRecords.length > 0 ? (
                            <ul className="space-y-4">
                                {dataRecords.map((item) => (
                                    <li key={item.id} className="p-4 border border-gray-100 rounded-lg bg-gray-50 mb-4">
                                        <p className="text-gray-800 font-medium">{item.content}</p>

                                        {/* Pass the ID of the post to the RateButton */}
                                        <RateButton captionId={item.id} />

                                        <div className="text-xs text-gray-400 mt-2">
                                            ID: {item.id.substring(0, 8)}...
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic">No records found or RLS is blocking access.</p>
                        )}
                    </div>
                )}
            </div>

            <footer className="mt-10 text-gray-400 text-xs text-center">
                Assignment 3 • Built with Next.js & Supabase Auth
            </footer>
        </main>
    )
}
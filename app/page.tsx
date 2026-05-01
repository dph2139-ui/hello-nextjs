import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import LoginButton from '@/components/LoginButton'
import RateButton from '@/components/RateButton'
import ImageUploader from '@/components/ImageUploader'

export default async function Home() {
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id

    let captions: any[] = []
    if (user) {
        const { data } = await supabase
            .from('captions')
            .select('*')
            .order('created_datetime_utc', { ascending: false })
        captions = data || []
    }

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h1 className="text-xl font-black text-gray-900 tracking-tight">AlmostCrackd 😂</h1>
                {user && (
                    <span className="text-sm text-gray-500">{user.email}</span>
                )}
            </header>

            {!user ? (
                /* --- LOGGED OUT --- */
                <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
                    <p className="text-5xl mb-6">😂</p>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Rate AI-generated captions</h2>
                    <p className="text-gray-500 mb-8 max-w-sm">Upload a photo, get AI captions, and vote on what's actually funny.</p>
                    <LoginButton />
                </div>
            ) : (
                <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">

                    {/* Upload section */}
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Generate Captions</h2>
                        <ImageUploader userId={userId} />
                    </section>

                    {/* Caption feed */}
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Rate Captions</h2>
                        {captions.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl">
                                No captions yet — upload an image above to get started.
                            </div>
                        ) : (
                            <ul className="space-y-4">
                                {captions.map((item) => (
                                    <li key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt="Caption image"
                                                className="w-full max-h-72 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-gray-300 text-sm">
                                                No image
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <p className="font-semibold text-gray-800 text-lg leading-snug">{item.content}</p>
                                            <RateButton captionId={item.id} userId={userId} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            )}

            <footer className="text-center text-xs text-gray-300 py-8">
                Built with Next.js & Supabase
            </footer>
        </main>
    )
}

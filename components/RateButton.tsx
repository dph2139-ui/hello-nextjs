'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function RateButton({ captionId, userId }: { captionId: string; userId?: string }) {
    const [vote, setVote] = useState<'up' | 'down' | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        if (!userId) return
        supabase
            .from('caption_votes')
            .select('vote_value')
            .eq('caption_id', captionId)
            .eq('profile_id', userId)
            .maybeSingle()
            .then(({ data }) => {
                if (data) setVote(data.vote_value === 1 ? 'up' : 'down')
            })
    }, [captionId, userId])

    const handleVote = async (isUpvote: boolean) => {
        if (!userId) return
        setLoading(true)
        const newVote = isUpvote ? 'up' : 'down'

        if (vote === newVote) {
            await supabase.from('caption_votes').delete()
                .eq('caption_id', captionId).eq('profile_id', userId)
            setVote(null)
        } else {
            await supabase.from('caption_votes').upsert({
                caption_id: captionId,
                vote_value: isUpvote ? 1 : -1,
                profile_id: userId,
                created_by_user_id: userId,
                modified_by_user_id: userId,
            }, { onConflict: 'caption_id,profile_id' })
            setVote(newVote)
        }

        setLoading(false)
        router.refresh()
    }

    return (
        <div className="flex gap-2 mt-3">
            <button
                onClick={() => handleVote(true)}
                disabled={loading}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    vote === 'up'
                        ? 'bg-green-500 border-green-500 text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600'
                }`}
            >
                👍 Funny
            </button>
            <button
                onClick={() => handleVote(false)}
                disabled={loading}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    vote === 'down'
                        ? 'bg-red-500 border-red-500 text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-500'
                }`}
            >
                👎 Not Funny
            </button>
        </div>
    )
}

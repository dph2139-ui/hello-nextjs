'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function RateButton({ captionId }: { captionId: string }) {
    const router = useRouter()
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleVote = async (isUpvote: boolean) => {
        // 1. Get the current user's session data
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            alert("You must be logged in to vote!")
            return
        }

        // 2. Insert the vote including the profile_id (the user's ID)
        const { error } = await supabase
            .from('caption_votes')
            .insert({
                caption_id: captionId,
                vote_value: isUpvote ? 1 : -1,
                created_datetime_utc: new Date().toISOString(),
                // FIX: Providing the user's ID to satisfy the profile_id requirement
                profile_id: user.id
            })

        if (error) {
            console.error('Error details:', error)
            alert(`Error: ${error.message}`)
        } else {
            alert('Vote submitted successfully!')
            router.refresh()
        }
    }

    return (
        <div className="flex gap-2 mt-2">
            <button
                onClick={() => handleVote(true)}
                className="bg-gray-200 hover:bg-green-200 px-3 py-1 rounded text-sm"
            >
                👍 Upvote
            </button>
            <button
                onClick={() => handleVote(false)}
                className="bg-gray-200 hover:bg-red-200 px-3 py-1 rounded text-sm"
            >
                👎 Downvote
            </button>
        </div>
    )
}
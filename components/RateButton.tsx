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
        // 1. Mutate the data: Insert a new row into caption_votes
        const { error } = await supabase
            .from('caption_votes')
            .insert({
                caption_id: captionId,
                vote_type: isUpvote ? 'up' : 'down',
            })

        if (error) {
            console.error('Error voting:', error.message)
            alert('Could not submit vote. Make sure you are logged in!')
        } else {
            // 2. Refresh the page to show the updated vote count (optional)
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
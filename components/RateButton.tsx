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
        const { error } = await supabase
            .from('caption_votes')
            .insert({
                caption_id: captionId, // Matches your table
                vote_value: isUpvote ? 1 : -1, // Use 1 and -1 instead of strings
            })

        if (error) {
            console.error('Error details:', error)
            alert(`Error: ${error.message}`)
        } else {
            alert('Vote submitted!')
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
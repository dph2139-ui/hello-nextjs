'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function RateButton({ captionId }: { captionId: string; userId?: string }) {
    const router = useRouter()
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleVote = async (isUpvote: boolean) => {
        // 1. Fetch the user session right when the button is clicked
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            alert("You must be logged in to vote!")
            return
        }

        const activeUserId = user.id

        // 2. Perform the insert with the mandatory audit fields
        const { error } = await supabase
            .from('caption_votes')
            .insert({
                caption_id: captionId,
                vote_value: isUpvote ? 1 : -1,
                profile_id: activeUserId,
                // THE MANDATORY AUDIT FIELDS
                created_by_user_id: activeUserId,
                modified_by_user_id: activeUserId
                // Note: created_datetime_utc and modified_datetime_utc are handled by the DB
            })

        if (error) {
            console.error('Database Error:', error)
            alert(`Error: ${error.message}`)
        } else {
            alert('Vote submitted successfully!')
            router.refresh() // Refresh the page to show updated counts
        }
    }

    return (
        <div className="flex gap-4 mt-4">
            <button
                onClick={() => handleVote(true)}
                className="px-4 py-2 bg-white border-2 border-gray-400 rounded-md shadow-sm hover:bg-gray-100 font-black flex items-center gap-2 transition-colors"
                style={{ color: '#000000' }}
            >
                <span style={{ fontSize: '1.2rem' }}>👍</span> Upvote
            </button>

            <button
                onClick={() => handleVote(false)}
                className="px-4 py-2 bg-white border-2 border-gray-400 rounded-md shadow-sm hover:bg-gray-100 font-black flex items-center gap-2 transition-colors"
                style={{ color: '#000000' }}
            >
                <span style={{ fontSize: '1.2rem' }}>👎</span> Downvote
            </button>
        </div>
    )
}
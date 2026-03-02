'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function RateButton({ captionId }: { captionId: string }) {
    const router = useRouter()
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleVote = async (isUpvote: boolean) => {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            alert("You must be logged in to vote!")
            return
        }

        const { error } = await supabase
            .from('caption_votes')
            .insert({
                caption_id: captionId,
                vote_value: isUpvote ? 1 : -1,
                created_datetime_utc: new Date().toISOString(),
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
        <div className="flex gap-4 mt-4">
            <button
                onClick={() => handleVote(true)}
                className="px-4 py-2 bg-white border-2 border-gray-400 rounded-md shadow-sm hover:bg-gray-100 font-black flex items-center gap-2 transition-colors"
                style={{ color: '#000000' }} /* FORCE BLACK TEXT */
            >
                <span style={{ fontSize: '1.2rem' }}>👍</span> Upvote
            </button>

            <button
                onClick={() => handleVote(false)}
                className="px-4 py-2 bg-white border-2 border-gray-400 rounded-md shadow-sm hover:bg-gray-100 font-black flex items-center gap-2 transition-colors"
                style={{ color: '#000000' }} /* FORCE BLACK TEXT */
            >
                <span style={{ fontSize: '1.2rem' }}>👎</span> Downvote
            </button>
        </div>
    )
}
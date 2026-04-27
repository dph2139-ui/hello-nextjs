'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function ImageUploader({ userId }: { userId?: string }) {
    const [uploading, setUploading] = useState(false)
    const [captions, setCaptions] = useState<any[]>([])

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setCaptions([])

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            if (!token) throw new Error("Please log in again.")

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }

            // Step 1: Generate Presigned URL
            const res1 = await fetch('https://api.almostcrackd.ai/pipeline/generate-presigned-url', {
                method: 'POST',
                headers,
                body: JSON.stringify({ contentType: file.type })
            })
            const { presignedUrl, cdnUrl } = await res1.json()

            // Step 2: Upload Bytes
            await fetch(presignedUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file
            })

            // Step 3: Register Image
            const res3 = await fetch('https://api.almostcrackd.ai/pipeline/upload-image-from-url', {
                method: 'POST',
                headers,
                body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false })
            })
            const { imageId } = await res3.json()

            // Step 4: Generate Captions
            const res4 = await fetch('https://api.almostcrackd.ai/pipeline/generate-captions', {
                method: 'POST',
                headers,
                body: JSON.stringify({ imageId })
            })
            const generatedCaptions = await res4.json()

            setCaptions(generatedCaptions)

            // --- STEP 5: SAVE TO DATABASE [NEW] ---
            if (userId && generatedCaptions.length > 0) {
                // We map through the AI results and save each one
                for (const caption of generatedCaptions) {
                    const content = typeof caption === 'string' ? caption : (caption.content || "");

                    const { error: dbError } = await supabase
                        .from('captions')
                        .insert([{
                            content: content,
                            image_id: imageId, // ID from the AI pipeline
                            // THE TWO MANDATORY AUDIT FIELDS:
                            created_by_user_id: userId,
                            modified_by_user_id: userId
                        }])

                    if (dbError) console.error("DB Save Error:", dbError.message)
                }
            }

        } catch (err: any) {
            console.error(err)
            alert("Error: " + err.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-white shadow-md">
            {/* Heading with Stubborn Fix */}
            <h3 className="text-xl font-bold mb-4" style={{ color: '#000000' }}>
                Upload Image for AI Captions
            </h3>

            <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="block w-full text-sm mb-4"
                style={{ color: '#000000' }}
            />

            {uploading && (
                <p className="text-blue-600 font-bold animate-pulse">
                    Analyzing image and generating captions...
                </p>
            )}

            {captions.length > 0 && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                    {/* Section Header with Stubborn Fix */}
                    <h4 className="font-black mb-3 text-lg border-b border-gray-400 pb-1" style={{ color: '#000000' }}>
                        AI Generated Results:
                    </h4>

                    <ul className="space-y-3">
                        {captions.map((c, i) => (
                            <li
                                key={i}
                                className="p-4 bg-white rounded shadow border border-gray-200 text-lg font-bold"
                                style={{ color: '#000000' }} // THE STUBBORN FIX
                            >
                                {typeof c === 'string' ? c : (c.content || "Caption generated")}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
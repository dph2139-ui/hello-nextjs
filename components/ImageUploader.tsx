'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import RateButton from '@/components/RateButton'

interface SavedCaption {
    id: string
    content: string
}

export default function ImageUploader({ userId }: { userId?: string }) {
    const [uploading, setUploading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [captions, setCaptions] = useState<SavedCaption[]>([])
    const [error, setError] = useState<string | null>(null)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setCaptions([])
        setError(null)
        setImagePreview(URL.createObjectURL(file))

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token
            if (!token) throw new Error('Please log in again.')

            const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }

            // Step 1: Presigned URL
            const res1 = await fetch('https://api.almostcrackd.ai/pipeline/generate-presigned-url', {
                method: 'POST', headers, body: JSON.stringify({ contentType: file.type })
            })
            const { presignedUrl, cdnUrl } = await res1.json()

            // Step 2: Upload to S3
            await fetch(presignedUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })

            // Step 3: Register image
            const res3 = await fetch('https://api.almostcrackd.ai/pipeline/upload-image-from-url', {
                method: 'POST', headers, body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false })
            })
            const { imageId } = await res3.json()

            // Step 4: Generate captions
            const res4 = await fetch('https://api.almostcrackd.ai/pipeline/generate-captions', {
                method: 'POST', headers, body: JSON.stringify({ imageId })
            })
            const generatedCaptions = await res4.json()
            const captionList = Array.isArray(generatedCaptions) ? generatedCaptions : [generatedCaptions]

            // Step 5: Save each caption to DB (without image_url — save only known-good columns)
            if (userId) {
                for (const caption of captionList) {
                    const content = typeof caption === 'string' ? caption : (caption.content || '')
                    await supabase.from('captions').insert([{
                        content,
                        image_id: imageId,
                        created_by_user_id: userId,
                        modified_by_user_id: userId,
                    }])
                }
            }

            // Step 6: Fetch the IDs of what we just saved so RateButtons work
            const { data: saved } = await supabase
                .from('captions')
                .select('id, content')
                .eq('image_id', imageId)
                .order('created_datetime_utc', { ascending: false })
                .limit(captionList.length)

            setCaptions(saved || [])
        } catch (err: any) {
            console.error(err)
            setError(err.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="p-5 border-b border-gray-100">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploading && <p className="mt-3 text-sm text-blue-600 font-medium animate-pulse">Analyzing image and generating captions…</p>}
                {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            </div>

            {imagePreview && captions.length > 0 && (
                <div>
                    <img src={imagePreview} alt="Uploaded" className="w-full max-h-64 object-cover" />
                    <div className="divide-y divide-gray-100">
                        {captions.map((c) => (
                            <div key={c.id} className="p-4">
                                <p className="font-semibold text-gray-800">{c.content}</p>
                                <RateButton captionId={c.id} userId={userId} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

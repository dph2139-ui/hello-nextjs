import { supabase } from '../lib/supabaseClient';

export default async function Home() {
  // We are asking Supabase for everything in the 'posts' table
  const { data: items, error } = await supabase.from('sidechat_posts').select('*');

  // If the table 'posts' doesn't exist, this error will show up on your screen
  if (error) {
    return (
        <main className="p-10">
          <h1 className="text-red-500 font-bold">Error Connection to Supabase</h1>
          <p>{error.message}</p>
        </main>
    );
  }

    return (
        <main className="p-10">
            <h1 className="text-2xl font-bold mb-4">Community Posts</h1>
            <ul className="space-y-4">
                {items?.map((item: any) => (
                    <li key={item.id} className="p-4 border rounded shadow-sm">
                        {/* 2. Use 'item.content' to show the message you pasted */}
                        <p className="text-gray-800">{item.content}</p>
                        <div className="text-xs text-gray-500 mt-2">
                            Likes: {item.like_count} | Posted: {new Date(item.post_datetime_utc).toLocaleDateString()}
                        </div>
                    </li>
                ))}
            </ul>
        </main>
    );
}
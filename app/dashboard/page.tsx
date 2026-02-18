import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { BookmarkList, type Bookmark } from "@/components/BookmarkList";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();


  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/");
  }

  const { data: bookmarks, error: bookmarksError } = await supabase
    .from("bookmarks")
    .select("id, user_id, title, url, created_at")
    .order("created_at", { ascending: false });

  if (bookmarksError) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold">Your bookmarks</h1>
        <p className="mt-4 text-red-600">Failed to load bookmarks.</p>
      </main>
    );
  }
  console.log("USER ID:", user.id);

  return (
   <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your bookmarks</h1>
        <LogoutButton />
      </div>
      <BookmarkList userId={user.id} initialBookmarks={(bookmarks ?? []) as Bookmark[]} />
    </main>
  );
}

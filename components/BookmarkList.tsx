"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { BookmarkForm } from "@/components/BookmarkForm";

export type Bookmark = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  created_at: string;
};

type BookmarkListProps = {
  userId: string;
  initialBookmarks: Bookmark[];
};

export function BookmarkList({ userId, initialBookmarks }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setBookmarks(initialBookmarks);
  }, [initialBookmarks]);

useEffect(() => {
  const channel = supabase
    .channel(`bookmarks:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "bookmarks",
        // removed filter from here
      },
      (payload) => {
        setBookmarks((current) => {
          if (payload.eventType === "INSERT") {
            const inserted = payload.new as Bookmark;
            // filter by userId client-side
            if (inserted.user_id !== userId) return current;
            if (current.some((b) => b.id === inserted.id)) return current;
            return [inserted, ...current].sort(
              (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
            );
          }

          if (payload.eventType === "UPDATE") {
            const updated = payload.new as Bookmark;
            if (updated.user_id !== userId) return current;
            return current
              .map((b) => (b.id === updated.id ? updated : b))
              .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
          }

          if (payload.eventType === "DELETE") {
            const deletedId = String((payload.old as { id?: string }).id ?? "");
            return current.filter((b) => b.id !== deletedId);
          }

          return current;
        });
      }
    )
    .subscribe((status) => {
      console.log("Realtime status:", status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, [userId]);

  const empty = useMemo(() => bookmarks.length === 0, [bookmarks.length]);

  async function handleAdd(title: string, url: string) {
  setIsAdding(true);
  const { data, error } = await supabase
    .from("bookmarks")
    .insert({ user_id: userId, title, url })
    .select()
    .single();
  setIsAdding(false);

  if (error) {
    alert(error.message);
    return;
  }

  // Optimistically add to UI immediately
  setBookmarks((current) => {
    if (current.some((b) => b.id === data.id)) return current;
    return [data as Bookmark, ...current].sort(
      (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
    );
  });
}

  async function handleDelete(id: string) {
  setDeletingIds((prev) => ({ ...prev, [id]: true }));
  const { error } = await supabase.from("bookmarks").delete().eq("id", id);
  setDeletingIds((prev) => ({ ...prev, [id]: false }));
  console.log("DELETE error:", error);
  if (error) alert(error.message);
}

  return (
    <section className="mt-4">
      <BookmarkForm onAdd={handleAdd} isLoading={isAdding} />

      {empty ? (
        <p className="mt-6 text-gray-600">No bookmarks yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {bookmarks.map((bookmark) => (
            <li key={bookmark.id} className="flex items-center justify-between rounded-lg border p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{bookmark.title}</p>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-sm text-blue-600 underline"
                >
                  {bookmark.url}
                </a>
              </div>
              <button
                onClick={() => handleDelete(bookmark.id)}
                disabled={Boolean(deletingIds[bookmark.id])}
                className="ml-4 rounded-md border px-3 py-1 text-sm disabled:opacity-60"
              >
                {deletingIds[bookmark.id] ? "Deleting..." : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

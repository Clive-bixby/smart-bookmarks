"use client";

import { useState } from "react";

type BookmarkFormProps = {
  onAdd: (title: string, url: string) => Promise<void>;
  isLoading: boolean;
};

export function BookmarkForm({ onAdd, isLoading }: BookmarkFormProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !url.trim()) return;

    await onAdd(title.trim(), url.trim());

    setTitle("");
    setUrl("");
  }

   return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex flex-col gap-3 rounded-lg border p-4"
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        required
        className="rounded-md border px-3 py-2"
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        type="url"
        placeholder="https://example.com"
        required
        className="rounded-md border px-3 py-2"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        {isLoading ? "Adding..." : "Add bookmark"}
      </button>
    </form>
  );
}

Smart Bookmark App

A full-stack bookmark manager built with Next.js App Router and Supabase, featuring secure Google OAuth authentication, row-level security, and realtime synchronization.

🛠 Tech Stack

Next.js 16 (App Router)

Supabase (Auth, Postgres, Realtime)

Tailwind CSS

Vercel (Deployment)

🔐 Authentication

Google OAuth using PKCE flow

Implemented with @supabase/ssr

Middleware (proxy) ensures session persistence across navigations

Auth Flow:

App → Google → Supabase → /auth/callback → /dashboard

🛡 Security (Row-Level Security)

Bookmarks table uses RLS policies:

Users can only insert their own bookmarks

Users can only view their own bookmarks

Users can only delete their own bookmarks

All enforced at the database level using:

auth.uid() = user_id


Even malicious queries cannot access other users’ data.

⚡ Realtime

Supabase Realtime subscription per user

REPLICA IDENTITY FULL enabled for delete events

Optimistic UI updates for instant UX

Deduplication logic prevents double renders

🧠 Challenges Faced & Solutions

Implicit vs PKCE auth mismatch

Fixed by using createBrowserClient from @supabase/ssr

Session loss across navigation

Implemented proxy middleware for SSR cookie persistence

Delete events missing payload

Enabled REPLICA IDENTITY FULL in Postgres

Next.js 16 prerender redirect loop

Forced dynamic rendering for authenticated routes

✨ Features

Google login

Private bookmarks

Add & delete

Realtime sync across tabs

Secure production deployment

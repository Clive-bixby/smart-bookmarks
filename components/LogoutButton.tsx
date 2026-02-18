"use client";

import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-md border px-3 py-1 text-sm"
    >
      Logout
    </button>
  );
}

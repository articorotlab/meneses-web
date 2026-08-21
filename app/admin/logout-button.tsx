"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function LogoutButton() {
  const router =
    useRouter();

  const [loading, setLoading] =
    useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );

      router.replace(
        "/admin/login"
      );

      router.refresh();

    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="admin-logout-button"
      onClick={handleLogout}
      disabled={loading}
    >
      <LogOut size={17} />
      {loading
        ? "Cerrando..."
        : "Cerrar sesión"}
    </button>
  );
}

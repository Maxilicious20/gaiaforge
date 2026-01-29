"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminControls({ modId }: { modId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAction = async (action: "approve" | "reject") => {
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modId, action })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Action failed");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button 
          onClick={() => handleAction("approve")} 
          disabled={loading}
          className="px-6 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded font-bold"
        >
            {loading ? "..." : "✅ Approve"}
        </button>
        <button 
          onClick={() => handleAction("reject")} 
          disabled={loading}
          className="px-6 py-2 bg-red-900/50 hover:bg-red-900 disabled:bg-gray-600 text-red-200 border border-red-800 rounded text-sm"
        >
            {loading ? "..." : "❌ Reject"}
        </button>
    </div>
  );
}

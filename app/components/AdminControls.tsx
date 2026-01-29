"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminControls({ modId }: { modId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showBanReason, setShowBanReason] = useState(false);
  const [banReason, setBanReason] = useState("");

  const handleAction = async (action: "approve" | "reject" | "ban") => {
    if (action === "ban" && !banReason.trim()) {
      setError("Please provide a ban reason");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      let url = "/api/admin/approve";
      let body: any = { modId, action };

      if (action === "ban") {
        url = "/api/admin/ban";
        // Get mod author to ban
        const modRes = await fetch(`/api/mod/${modId}`);
        if (!modRes.ok) throw new Error("Could not fetch mod");
        const modData = await modRes.json();
        body = { userId: modData.authorId, action: "ban", reason: banReason };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Action failed");
      }

      // Reload page after successful action
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 min-w-max">
        {error && <p className="text-red-400 text-xs bg-red-900/30 p-2 rounded">{error}</p>}
        
        <button 
          onClick={() => handleAction("approve")} 
          disabled={loading}
          className="px-6 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-bold text-sm whitespace-nowrap transition"
        >
            {loading ? "Processing..." : "✅ Approve"}
        </button>

        <button 
          onClick={() => handleAction("reject")} 
          disabled={loading}
          className="px-6 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-bold text-sm whitespace-nowrap transition"
        >
            {loading ? "Processing..." : "⛔ Reject"}
        </button>

        <button 
          onClick={() => setShowBanReason(!showBanReason)} 
          disabled={loading}
          className="px-6 py-2 bg-red-700 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-bold text-sm whitespace-nowrap transition"
        >
            {loading ? "Processing..." : "🚫 Ban Author"}
        </button>

        {showBanReason && (
          <div className="bg-black/50 border border-red-600 p-3 rounded">
            <input 
              type="text"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Reason for ban..."
              className="w-full bg-black border border-red-600 p-2 rounded text-white text-xs mb-2"
            />
            <button 
              onClick={() => handleAction("ban")}
              disabled={loading}
              className="w-full px-4 py-1 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 rounded font-bold text-xs"
            >
              Confirm Ban
            </button>
          </div>
        )}
    </div>
  );
}
    </div>
  );
}

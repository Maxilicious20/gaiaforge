"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// Die verfügbaren Bilder im public Ordner
const backgrounds = ["hero-bg.jpg", "1hero-bg.jpg", "2hero-bg.jpg", "3hero-bg.jpg", "4hero-bg.jpg"];

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const [username, setUsername] = useState("");
    const [selectedBg, setSelectedBg] = useState("hero-bg.jpg");
  const [msg, setMsg] = useState("");

    useEffect(() => {
        // Load current stored profile data from the server
        const load = async () => {
            const res = await fetch("/api/user/settings");
            if (!res.ok) return;
            const data = await res.json();
            if (data.username !== undefined) setUsername(data.username || "");
            if (data.backgroundImage) setSelectedBg(data.backgroundImage);
        };
        load();
    }, []);

  // Wir holen uns die aktuellen Daten vom User (nicht nur Session, sondern echte DB Daten)
  // Einfachheitshalber nehmen wir hier an, session hat die Daten nach einem Relogin/Update
  // Für PROD sollten wir hier einen Fetch machen. Wir simulieren es kurz:

    const handleSave = async () => {
        const res = await fetch("/api/user/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, bgImage: selectedBg }),
        });
        const data = await res.json();
        if (data.error) setMsg("❌ " + data.error);
        else {
                setMsg("✅ Profile updated!");
                // refresh server data and session
                await update();
                const refreshed = await fetch("/api/user/settings");
                if (refreshed.ok) {
                    const d = await refreshed.json();
                    if (d.backgroundImage) setSelectedBg(d.backgroundImage);
                    if (d.username !== undefined) setUsername(d.username || "");
                }
        }
    };

  return (
    <div className="min-h-screen bg-black text-white p-10 flex flex-col items-center relative overflow-hidden">
        {/* Background Preview */}
        <div className="absolute inset-0 z-0 opacity-30">
             <Image src={`/${selectedBg}`} alt="bg" fill className="object-cover" />
        </div>

        <div className="z-10 bg-[#151b2b] p-8 rounded-xl border border-white/10 max-w-2xl w-full shadow-2xl">
            <h1 className="text-3xl font-bold mb-6 text-emerald-500">Profile Settings</h1>
            
            <div className="mb-6">
                <label className="block text-gray-400 mb-2">Username (Changeable every 3 days)</label>
                <input 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter unique username"
                    className="w-full bg-black/50 border border-white/20 p-3 rounded text-white"
                />
            </div>

            <div className="mb-8">
                <label className="block text-gray-400 mb-4">Choose Theme</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {backgrounds.map((bg, index) => (
                        <button 
                            key={bg} 
                            onClick={() => setSelectedBg(bg)}
                            className={`relative h-24 rounded-lg overflow-hidden border-2 transition ${selectedBg === bg ? 'border-emerald-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                            <Image src={`/${bg}`} alt="Theme" fill className="object-cover" />
                            <div className="absolute bottom-0 bg-black/70 w-full text-[10px] text-center py-1">Theme {index + 1}</div>
                        </button>
                    ))}
                </div>
            </div>

            {msg && <div className="mb-4 text-center font-bold">{msg}</div>}

            <div className="flex gap-4">
                <button onClick={handleSave} className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-3 rounded font-bold">Save Changes</button>
                <Link href="/" className="px-6 py-3 border border-white/20 rounded hover:bg-white/10">Cancel</Link>
            </div>
        </div>
    </div>
  );
}
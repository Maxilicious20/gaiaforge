"use client";
import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { notifyBackgroundChange } from "@/app/components/GlobalBackground";

// Die verfügbaren Bilder im public Ordner
const backgrounds = ["hero-bg.jpg", "1hero-bg.jpg", "2hero-bg.jpg", "3hero-bg.jpg", "4hero-bg.jpg"];

export default function SettingsPage() {
    const { data: session } = useSession();
    const [username, setUsername] = useState("");
    const [selectedBg, setSelectedBg] = useState("hero-bg.jpg");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session) {
            // Redirect if not logged in
            signIn();
            return;
        }

        // Load current stored profile data from the server
        const load = async () => {
            try {
                const res = await fetch("/api/user/settings");
                if (!res.ok) {
                    console.error("Failed to load settings");
                    return;
                }
                const data = await res.json();
                if (data.username !== undefined) setUsername(data.username || "");
                if (data.backgroundImage) setSelectedBg(data.backgroundImage);
            } catch (e) {
                console.error("Failed to load settings:", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [session]);

    const handleSave = async () => {
        if (!session?.user?.email) {
            setMsg("❌ Not logged in");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch("/api/user/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, bgImage: selectedBg }),
            });
            const data = await res.json();
            if (data.error) {
                setMsg("❌ " + data.error);
            } else {
                setMsg("✅ Profile updated!");
                // Notify GlobalBackground of the change
                notifyBackgroundChange(selectedBg);
                // Reload to verify
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (e) {
            setMsg("❌ Error saving profile");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-black text-white p-10 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="z-10 bg-[#151b2b] p-8 rounded-xl border border-white/10 max-w-2xl w-full shadow-2xl text-center">
                    <h1 className="text-3xl font-bold mb-6 text-emerald-500">Please Log In</h1>
                    <p className="text-gray-400 mb-6">You need to be logged in to access settings.</p>
                    <Link href="/" className="inline-block bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded font-bold text-white">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-10 flex flex-col items-center relative overflow-hidden">
            {/* Background Preview */}
            <div className="absolute inset-0 z-0 opacity-30">
                 <Image src={`/${selectedBg}`} alt="bg" fill className="object-cover" />
            </div>

            <div className="z-10 bg-[#151b2b] p-8 rounded-xl border border-white/10 max-w-2xl w-full shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-emerald-500">Profile Settings</h1>
                    <Link href="/" className="text-emerald-400 hover:text-emerald-300 text-sm underline">
                        ← Back Home
                    </Link>
                </div>
                
                <div className="mb-6">
                    <label className="block text-gray-400 mb-2">Username (Changeable every 3 days)</label>
                    <input 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter unique username"
                        className="w-full bg-black/50 border border-white/20 p-3 rounded text-white"
                        disabled={loading}
                    />
                </div>

                <div className="mb-8">
                    <label className="block text-gray-400 mb-4">Choose Theme</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {backgrounds.map((bg, index) => (
                            <button 
                                key={bg} 
                                onClick={() => setSelectedBg(bg)}
                                disabled={loading}
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
                    <button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 py-3 rounded font-bold"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <Link href="/" className="px-6 py-3 border border-white/20 rounded hover:bg-white/10 flex items-center justify-center">
                        Cancel
                    </Link>
                </div>
            </div>
        </div>
    );
}
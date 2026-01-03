"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

// Typ für die Mods
interface Mod {
  id: string;
  title: string;
  description: string;
  author: { name: string };
  category: string;
  _count: { votes: number }; // Vereinfacht für die Übersicht
}

export default function Home() {
  const { data: session } = useSession();
  const [mods, setMods] = useState<Mod[]>([]);

  // Mods laden (Wir simulieren das Fetching hier kurz)
  useEffect(() => {
    fetch("/api/mods/list") // Diese Route bauen wir gleich
      .then((res) => res.json())
      .then((data) => setMods(data.mods || []));
  }, []);

  const isAdmin = session?.user?.email === "emergencyhessen@gmail.com";

  return (
    <main className="min-h-screen bg-[#0b0f19] text-gray-200 font-sans">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#151b2b] p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="text-2xl font-bold text-emerald-500 tracking-wider">GaiaForge</div>
        
        <div className="flex gap-4 items-center">
            {/* ADMIN BUTTON - Nur für dich sichtbar */}
            {isAdmin && (
                <Link href="/admin" className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded uppercase">
                    👑 Admin Panel
                </Link>
            )}

            <Link href="/upload" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold transition">
                + Upload Mod
            </Link>
            
            {session ? (
                <button onClick={() => signOut()} className="text-sm hover:text-white text-gray-400">Logout</button>
            ) : (
                <button onClick={() => signIn()} className="text-sm hover:text-white text-gray-400">Login</button>
            )}
        </div>
      </nav>

      {/* Hero / Search */}
    <section className="py-20 text-center bg-linear-to-b from-[#151b2b] to-[#0b0f19]">
        <h1 className="text-5xl font-extrabold text-white mb-4">Discover Hytale Mods</h1>
        <p className="text-gray-400 max-w-xl mx-auto mb-8">
            The community repository. Upload your creations, get feedback, and expand your world.
        </p>
        <div className="max-w-md mx-auto relative">
            <input type="text" placeholder="Search mods..." className="w-full bg-black/50 border border-white/20 rounded-full py-3 px-6 text-white focus:outline-none focus:border-emerald-500" />
        </div>
      </section>

      {/* Mod Grid */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mods.map((mod) => (
                <div key={mod.id} className="bg-[#151b2b] border border-white/5 rounded-xl overflow-hidden hover:border-emerald-500/50 transition group">
                    <div className="h-32 bg-gray-800 relative">
                        {/* Platzhalter für Mod Image */}
                        <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-bold text-4xl opacity-20">
                            {mod.title.charAt(0)}
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-emerald-400 uppercase bg-emerald-900/30 px-2 py-0.5 rounded">{mod.category}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-400 transition">{mod.title}</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{mod.description}</p>
                        
                        <div className="flex justify-between items-center text-xs text-gray-400 border-t border-white/5 pt-3">
                            <span>by {mod.author.name || "Unknown"}</span>
                            <Link href={`/mod/${mod.id}`} className="text-white hover:underline">
                                View Details →
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        {mods.length === 0 && (
            <div className="text-center text-gray-500 py-20">No mods found. Be the first to upload one!</div>
        )}
      </section>
    </main>
  );
}
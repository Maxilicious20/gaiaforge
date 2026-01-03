"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Mod {
  id: string;
  title: string;
  description: string;
  author: { name: string, username: string };
  category: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [mods, setMods] = useState<Mod[]>([]);

  // Hier laden wir die Mods (Mockup oder echter Fetch)
  useEffect(() => {
     // Fetch hier einbauen...
  }, []);

  const isAdmin = session?.user?.email === "emergencyhessen@gmail.com";

  return (
    <main className="min-h-screen relative bg-[#0b0f19] text-gray-200 font-sans overflow-x-hidden">
      
      {/* 1. DYNAMISCHER HINTERGRUND */}
      <div className="fixed inset-0 z-0">
         {/* Wir nutzen standardmäßig hero-bg, außer wir bauen einen komplexen Fetch für Settings */}
         <Image 
            src="/hero-bg.jpg" 
            alt="Background" 
            fill 
            className="object-cover opacity-40"
            priority
         />
         <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/80 to-transparent" />
      </div>

      {/* 2. NAVBAR (Verbessert) */}
      <nav className="border-b border-white/10 bg-[#151b2b]/80 backdrop-blur-md p-4 flex justify-between items-center sticky top-0 z-50 shadow-lg">
        <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-emerald-500 tracking-wider font-cinzel">GaiaForge</div>
            <span className="text-[10px] bg-emerald-900 text-emerald-300 px-1 rounded border border-emerald-500/30">ALPHA</span>
        </Link>
        
        <div className="flex gap-4 items-center">
            {isAdmin && (
                <Link href="/admin" className="px-3 py-1.5 bg-red-600/20 border border-red-500 hover:bg-red-600 text-red-100 hover:text-white text-xs font-bold rounded uppercase transition">
                    🛡️ Admin Panel
                </Link>
            )}

            <Link href="/upload" className="hidden sm:block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold transition shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                + Upload Mod
            </Link>
            
            {session ? (
                <div className="flex items-center gap-4 bg-black/40 px-4 py-1.5 rounded-full border border-white/10">
                    <div className="text-right">
                         {/* Zeige Email oder Username */}
                         <div className="text-xs text-emerald-400 font-bold">Logged in</div>
                         <div className="text-xs text-white">{session.user?.email}</div>
                    </div>
                    
                    <Link href="/settings" className="p-2 hover:bg-white/10 rounded-full transition" title="Settings">
                        ⚙️
                    </Link>

                    <button onClick={() => signOut()} className="text-xs bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white px-2 py-1 rounded transition">
                        Logout
                    </button>
                </div>
            ) : (
                <button onClick={() => signIn()} className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition">
                    Login
                </button>
            )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] font-cinzel">
            Discover <span className="text-emerald-500">Hytale</span> Mods
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10 drop-shadow-md">
            The ultimate community repository. Share your creations, find new adventures, and build the future of Hytale together.
        </p>
        
        <div className="max-w-xl mx-auto relative group">
            <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 group-hover:opacity-30 transition"></div>
            <input type="text" placeholder="Search for mods, authors, or tags..." className="relative w-full bg-black/60 border border-white/20 backdrop-blur-xl rounded-full py-4 px-8 text-white focus:outline-none focus:border-emerald-500 transition shadow-2xl text-lg" />
        </div>
      </section>

      {/* Mod Grid (Placeholder) */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-10">
         {/* ... Hier kommt dein Grid Code von vorher rein ... */}
         {/* Falls leer: */}
         <div className="text-center py-20 bg-black/20 rounded-xl border border-white/5 backdrop-blur-sm">
            <div className="text-6xl mb-4">⛏️</div>
            <h3 className="text-2xl font-bold text-white mb-2">The Forge is Empty</h3>
            <p className="text-gray-400">Be the first legend to upload a mod.</p>
            <Link href="/upload" className="mt-6 inline-block text-emerald-400 hover:text-emerald-300 underline">Start Uploading</Link>
         </div>
      </section>
    </main>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();
  const [prompt, setPrompt] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState("");

  // Checkt nach dem Login, ob noch ein Prompt wartet
  useEffect(() => {
    const savedPrompt = localStorage.getItem("pendingPrompt");
    if (session && savedPrompt) {
      // setState asynchron aufrufen, um synchrones Setzen innerhalb des Effects zu vermeiden
      setTimeout(() => {
        setPrompt(savedPrompt);
        // Hier würde später die KI automatisch starten
        // alert("Welcome back! Ready to execute: " + savedPrompt);
        localStorage.removeItem("pendingPrompt");
      }, 0);
    }
  }, [session]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    if (!session) {
      // Nicht eingeloggt -> Prompt merken und Modal zeigen
      setPendingPrompt(prompt);
      localStorage.setItem("pendingPrompt", prompt);
      setShowLoginModal(true);
    } else {
      // Eingeloggt -> Hier startet später die KI
      console.log("Generating with prompt:", prompt);
      alert("AI Generation started for: " + prompt);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden bg-[#111]">
      
      {/* Background Image Fix */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/hero-bg.jpg" // Stelle sicher, dass das Bild exakt so in public liegt
          alt="Background" 
          fill 
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a/80]" />
      </div>

      {/* Navbar (Minimal) */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
        <div className="text-xl font-bold tracking-widest text-emerald-500 uppercase">
          GaiaForge <span className="text-xs text-gray-500 align-top">Alpha</span>
        </div>
        <div>
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300 hidden sm:block">{session.user?.email}</span>
              <button 
                onClick={() => signOut()}
                className="px-4 py-2 text-sm bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 transition rounded"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 text-sm bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-500/40 transition rounded text-emerald-400"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Main Interface (Creative Mode Style) */}
      <div className="relative z-10 w-full max-w-3xl px-4 flex flex-col gap-6 animate-in fade-in zoom-in duration-500">
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white/90">
            What do you want to create?
          </h1>
          <p className="text-gray-400 text-sm">
            Describe a weapon, entity, or mechanic. GaiaForge will generate the code.
          </p>
        </div>

        {/* Input Box - Console Style */}
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg p-2 shadow-2xl ring-1 ring-white/5 focus-within:ring-emerald-500/50 transition-all">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A flaming sword that summons skeletons when hitting a player..."
            className="w-full h-32 bg-transparent text-lg p-4 outline-none resize-none text-emerald-50 placeholder:text-gray-600 font-mono"
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                }
            }}
          />
          <div className="flex justify-between items-center px-4 pb-2 pt-2 border-t border-white/10">
            <div className="text-xs text-gray-500 font-mono">Hytale API: Waiting for context...</div>
            <button 
              onClick={handleGenerate}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded transition shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              Initialize Forge
            </button>
          </div>
        </div>
      </div>

      {/* Login Modal Popup */}
      {showLoginModal && !session && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 p-8 rounded-xl max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              ✕
            </button>
            
            <h2 className="text-2xl font-bold mb-2">Access Required</h2>
            <p className="text-gray-400 mb-6 text-sm">
              To execute this generation and save your assets, you need to be logged in.
            </p>

            <div className="space-y-3">
              <button 
                onClick={() => signIn("google")}
                className="w-full py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition flex justify-center items-center gap-2"
              >
                Continue with Google
              </button>
              <button 
                onClick={() => signIn("discord")}
                className="w-full py-3 bg-[#5865F2] text-white font-bold rounded hover:bg-[#4752C4] transition"
              >
                Continue with Discord
              </button>
            </div>
            
            {pendingPrompt && (
              <div className="mt-6 p-3 bg-emerald-900/20 border border-emerald-500/20 rounded text-xs text-emerald-400 font-mono">
                {'>'} Prompt saved. Will execute after login.
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
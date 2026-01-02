"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  const { data: session, update } = useSession(); // 'update' importiert um Credits live zu aktualisieren
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("weapon");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Ladezustand

  useEffect(() => {
    const savedPrompt = localStorage.getItem("pendingPrompt");
    if (session && savedPrompt) {
      setTimeout(() => {
        setPrompt(savedPrompt);
        localStorage.removeItem("pendingPrompt");
      }, 0);
    }
  }, [session]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (!session) {
      localStorage.setItem("pendingPrompt", prompt);
      setShowLoginModal(true);
      return;
    }

    // Zugriff auf Credits Check (Frontend)
    if (session.user.credits <= 0) {
      alert("Not enough credits! You get 6 free credits every month.");
      return;
    }

    setIsLoading(true);

    try {
      // Hier rufen wir jetzt das echte Backend auf
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, category }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Something went wrong");
      } else {
        // Erfolg! Credits wurden abgezogen.
        await update(); // Aktualisiert die Session (und damit die Credits Anzeige oben)
        
        // Ausgabe der Nachricht (Server Antwort)
        alert(`SYSTEM MESSAGE:\n${data.message}\n\n(Credits remaining: ${data.credits})`);
      }

    } catch (error) {
      alert("Failed to connect to GaiaForge Server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden bg-[#111]">
      
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/hero-bg.jpg" 
          alt="Background" 
          fill 
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a/80]" />
      </div>

      {/* Navbar mit Credits Counter */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <div className="text-xl font-bold tracking-widest text-emerald-500 uppercase">
                GaiaForge 
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/50 text-emerald-400 border border-emerald-500/30">
                    BETA
                </span>
            </div>
            {/* NEU: Premium Button (Gesperrt) */}
            <button disabled className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-gray-800 bg-black/50 px-2 py-1 rounded cursor-not-allowed opacity-70 hover:opacity-70">
                🔒 Premium (Coming Soon)
            </button>
        </div>
        
        <div>
          {session ? (
            <div className="flex items-center gap-6">
              {/* Credit Counter Display */}
              <div className="flex items-center gap-2 px-3 py-1 bg-black/40 border border-white/10 rounded-full">
                <span className="text-yellow-400 text-lg">💎</span>
                <span className="font-mono font-bold text-emerald-100">
                    {/* Fallback, falls user.credits noch undefined ist beim Laden */}
                    {/* @ts-ignore */}
                    {session.user.credits?.toLocaleString() || 0}
                </span>
              </div>

              <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                      <div className="text-xs text-gray-400">Logged in as</div>
                      <div className="text-sm font-medium text-white">{session.user?.email}</div>
                  </div>
                  <button 
                    onClick={() => signOut()}
                    className="px-4 py-2 text-sm bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 transition rounded text-gray-300 hover:text-white"
                  >
                    Logout
                  </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition rounded shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Main Interface */}
      <div className="relative z-10 w-full max-w-3xl px-4 flex flex-col gap-6 animate-in fade-in zoom-in duration-500">
        
        <div className="text-center space-y-2 mb-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-2xl">
            Forge Your <span className="text-emerald-500">Hytale</span> Asset
          </h1>
          <p className="text-gray-400 text-lg">
            Select a category and describe your vision. AI handles the code.
          </p>
        </div>

        {/* Input Box Container */}
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5 focus-within:ring-emerald-500/50 transition-all">
          
          {/* Header: Category Selection */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2">
            <div className="flex items-center">
                <span className="text-xs font-bold text-gray-500 uppercase mr-3 tracking-wider">Mode:</span>
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-transparent text-emerald-400 text-sm font-bold outline-none cursor-pointer hover:text-emerald-300 uppercase tracking-wide"
                >
                    <option value="weapon" className="bg-black text-gray-300">⚔️ Weapon</option>
                    <option value="mob" className="bg-black text-gray-300">🧟 Entity / Mob</option>
                    <option value="block" className="bg-black text-gray-300">🧊 Block</option>
                    <option value="mechanic" className="bg-black text-gray-300">⚙️ Game Mechanic</option>
                    <option value="ui" className="bg-black text-gray-300">🖥️ Interface (XAML)</option>
                </select>
            </div>
          </div>

          {/* NEU: Disclaimer Warning Box */}
          <div className="bg-yellow-900/20 border-b border-yellow-500/20 px-4 py-2 text-[10px] text-yellow-500 font-mono flex items-center gap-2">
            ⚠️ NOTICE: Generation for <strong>{category.toUpperCase()}</strong> will be available after Hytale Early Access release. Results may be unstable due to game API changes.
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Describe your ${category} here... \nExample: A obsidian sword that glows purple and deals extra damage to skeletons.`}
            className="w-full h-40 bg-transparent text-lg p-5 outline-none resize-none text-gray-100 placeholder:text-gray-600 font-sans leading-relaxed"
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                }
            }}
          />
          
          <div className="flex justify-between items-center px-4 py-3 border-t border-white/10 bg-black/20">
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-emerald-500'} animate-pulse`}></span>
                <span className="text-xs text-gray-500 font-mono">
                    {isLoading ? "Forging..." : "System Ready"}
                </span>
            </div>
            <button 
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-8 py-2.5 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-lg transition transform hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
            >
              <span>{isLoading ? "Processing..." : "Generate"}</span>
              <span className="text-xs opacity-70 bg-black/20 px-1.5 py-0.5 rounded">-1 💎</span>
            </button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && !session && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#151515] border border-white/10 p-8 rounded-2xl max-w-sm w-full shadow-2xl relative text-center">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              ✕
            </button>
            
            <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🔒
            </div>

            <h2 className="text-2xl font-bold mb-2 text-white">Login Required</h2>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
              Create an account to save your assets.
              <br/>
              <span className="text-emerald-400 font-bold">Bonus: Start with 10 Credits!</span> (6 Credits/Month thereafter)
            </p>

            <div className="space-y-3">
              <button 
                onClick={() => signIn("google")}
                className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition flex justify-center items-center gap-3"
              >
                <img src="https://authjs.dev/img/providers/google.svg" className="w-5 h-5" alt="G" />
                Sign in with Google
              </button>
              <button 
                onClick={() => signIn("discord")} 
                className="w-full py-3 bg-[#5865F2] text-white font-bold rounded-lg hover:bg-[#4752C4] transition flex justify-center items-center gap-3"
              >
                <img src="https://assets-global.website-files.com/6257adef93867e56f84d3092/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" className="w-5 h-5" alt="D" />
                Sign in with Discord
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
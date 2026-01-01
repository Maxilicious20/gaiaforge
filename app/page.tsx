import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Navbar Platzhalter */}
      <nav className="fixed w-full z-50 flex justify-between items-center px-8 py-4 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="text-2xl font-bold tracking-tighter text-emerald-400">
          GaiaForge
        </div>
        <div className="space-x-4">
            <Link href="/api/auth/signin" className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition">
              Login
            </Link>
            <Link href="/api/auth/signin" className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 rounded-lg transition shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              Get Started
            </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden">
        {/* Hintergrundbild (Muss in public/hero-bg.jpg liegen) */}
        <div className="absolute inset-0 z-0 opacity-40">
           {/* Falls du noch kein Bild hast, nutzen wir diesen Gradient als Fallback */}
           <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-[#0a0a0a] to-[#0a0a0a]" />
           {/* <Image src="/hero-bg.jpg" alt="Hytale World" fill className="object-cover" /> */}
        </div>

        <div className="z-10 max-w-4xl space-y-6">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-emerald-300 uppercase bg-emerald-900/30 rounded-full border border-emerald-500/30">
            Ready for Hytale Launch
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-2xl">
            Forge Your Vision with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              AI Power
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Erstelle Hytale Models, JSON-Config und Skripte in Sekunden. 
            GaiaForge ist dein KI-Copilot für das nächste große Abenteuer.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl hover:scale-105 transition transform shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              Start Modding Free
            </button>
            <button className="px-8 py-4 text-lg font-bold bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition backdrop-blur-sm">
              View Features
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition group">
            <div className="w-12 h-12 mb-4 rounded-lg bg-emerald-900/50 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
              ⚡
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Instant Assets</h3>
            <p className="text-gray-400">Generiere JSON-Configs für Waffen und Mobs durch einfache Textbeschreibung.</p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition group">
            <div className="w-12 h-12 mb-4 rounded-lg bg-blue-900/50 flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
              🧠
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Smart Scripting</h3>
            <p className="text-gray-400">Unsere KI versteht die Hytale API (sobald released) und schreibt Java-Code für dich.</p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition group">
            <div className="w-12 h-12 mb-4 rounded-lg bg-purple-900/50 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
              💎
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Credits System</h3>
            <p className="text-gray-400">Behalte die volle Kontrolle über deine Generationen und Projekte in deinem Dashboard.</p>
          </div>
        </div>
      </section>

    </main>
  );
}
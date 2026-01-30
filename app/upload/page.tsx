"use client";
import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function UploadPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: "", description: "", category: "Magic", downloadUrl: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      signIn();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/mods/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Upload failed");
      
      alert("✅ Mod uploaded! Waiting for approval.");
      router.push("/");
    } catch (e) {
      alert("❌ Error uploading mod");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen relative flex items-center justify-center bg-black">
        <div className="absolute inset-0 z-0">
          <Image src="/hero-bg.jpg" alt="bg" fill className="object-cover opacity-20" />
        </div>

        <div className="z-10 bg-[#151b2b] border border-emerald-500/30 p-8 rounded-xl w-full max-w-lg shadow-2xl backdrop-blur-md text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Login Required</h1>
          <p className="text-gray-400 mb-6">You need to be logged in to upload mods.</p>
          <Link href="/" className="inline-block bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded font-bold text-white">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-black">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image src="/hero-bg.jpg" alt="bg" fill className="object-cover opacity-20" />
        </div>

        <form onSubmit={handleSubmit} className="z-10 bg-[#151b2b] border border-emerald-500/30 p-8 rounded-xl w-full max-w-lg shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-white">Upload Mod</h1>
              <Link href="/" className="text-emerald-400 hover:text-emerald-300 text-sm underline">
                ← Home
              </Link>
            </div>
            
            <input 
              className="w-full bg-black/50 border border-white/10 p-3 rounded mb-4 text-white" 
              placeholder="Mod Title" 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              value={formData.title}
              required 
              disabled={loading}
            />
            
            <textarea 
              className="w-full bg-black/50 border border-white/10 p-3 rounded mb-4 text-white h-32" 
              placeholder="Description" 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              value={formData.description}
              required 
              disabled={loading}
            />
            
            <select 
              className="w-full bg-black/50 border border-white/10 p-3 rounded mb-4 text-white" 
              onChange={e => setFormData({...formData, category: e.target.value})}
              value={formData.category}
              disabled={loading}
            >
                <option>Magic</option>
                <option>Tech</option>
                <option>Adventure</option>
                <option>Decoration</option>
            </select>

            <input 
              className="w-full bg-black/50 border border-white/10 p-3 rounded mb-6 text-white" 
              placeholder="Download URL (Drive, Dropbox...)" 
              onChange={e => setFormData({...formData, downloadUrl: e.target.value})} 
              value={formData.downloadUrl}
              required 
              disabled={loading}
            />

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 py-3 rounded font-bold text-white"
            >
              {loading ? "Submitting..." : "Submit for Review"}
            </button>
        </form>
    </div>
  );
}
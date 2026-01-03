"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function UploadPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: "", description: "", category: "Magic", downloadUrl: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/mods/create", { // Wir nutzen die API von vorher, evtl. neu anlegen
        method: "POST",
        body: JSON.stringify(formData)
    });
    alert("Mod uploaded! Waiting for approval.");
    router.push("/");
  };

  if (!session) return <div className="p-10 text-white">Please login first.</div>;

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-black">
        {/* Background Fix */}
        <div className="absolute inset-0 z-0">
             <Image src="/hero-bg.jpg" alt="bg" fill className="object-cover opacity-20" />
        </div>

        <form onSubmit={handleSubmit} className="z-10 bg-[#151b2b] border border-emerald-500/30 p-8 rounded-xl w-full max-w-lg shadow-2xl backdrop-blur-md">
            <h1 className="text-3xl font-bold text-white mb-6">Upload Mod</h1>
            
            <input className="w-full bg-black/50 border border-white/10 p-3 rounded mb-4 text-white" placeholder="Mod Title" onChange={e => setFormData({...formData, title: e.target.value})} required />
            
            <textarea className="w-full bg-black/50 border border-white/10 p-3 rounded mb-4 text-white h-32" placeholder="Description" onChange={e => setFormData({...formData, description: e.target.value})} required />
            
            <select className="w-full bg-black/50 border border-white/10 p-3 rounded mb-4 text-white" onChange={e => setFormData({...formData, category: e.target.value})}>
                <option>Magic</option>
                <option>Tech</option>
                <option>Adventure</option>
                <option>Decoration</option>
            </select>

            <input className="w-full bg-black/50 border border-white/10 p-3 rounded mb-6 text-white" placeholder="Download URL (Drive, Dropbox...)" onChange={e => setFormData({...formData, downloadUrl: e.target.value})} required />

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded font-bold text-white">Submit for Review</button>
        </form>
    </div>
  );
}
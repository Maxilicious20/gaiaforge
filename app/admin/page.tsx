import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AdminControls from "../components/AdminControls";

const prisma = new PrismaClient();

export default async function AdminPage() {
  // @ts-ignore
  const session = await getServerSession(authOptions);

  if (session?.user?.email !== "emergencyhessen@gmail.com") {
    redirect("/"); // Wegschicken, wenn nicht du
  }

  // Hole alle Mods, die noch NICHT veröffentlicht sind
  const pendingMods = await prisma.mod.findMany({
    where: { published: false },
    include: { author: true },
    orderBy: { createdAt: 'desc' }
  });

  // Statistiken
  const totalUsers = await prisma.user.count();
  const bannedUsers = await prisma.user.count({ where: { isBanned: true } });
  const totalMods = await prisma.mod.count();
  const publishedMods = await prisma.mod.count({ where: { published: true } });
  const pendingCount = pendingMods.length;

  // Gebannte Benutzer
  const banned = await prisma.user.findMany({
    where: { isBanned: true },
    orderBy: { bannedAt: 'desc' }
  });

  return (
    <main className="relative min-h-screen bg-black text-white p-10">
      {/* GlobalBackground wird hinter dem Inhalt gerendert */}
      <div className="relative z-10">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-red-500 mb-2">🛡️ Admin Command Center</h1>
          <p className="text-gray-400">GaiaForge Administration Dashboard</p>
        </div>

        {/* Statistiken Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          <div className="bg-gray-900/80 backdrop-blur border border-gray-700 p-6 rounded-lg">
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-emerald-400">{totalUsers}</p>
          </div>
          <div className="bg-gray-900/80 backdrop-blur border border-gray-700 p-6 rounded-lg">
            <p className="text-gray-400 text-sm">Banned Users</p>
            <p className="text-3xl font-bold text-red-400">{bannedUsers}</p>
          </div>
          <div className="bg-gray-900/80 backdrop-blur border border-gray-700 p-6 rounded-lg">
            <p className="text-gray-400 text-sm">Total Mods</p>
            <p className="text-3xl font-bold text-blue-400">{totalMods}</p>
          </div>
          <div className="bg-gray-900/80 backdrop-blur border border-gray-700 p-6 rounded-lg">
            <p className="text-gray-400 text-sm">Published Mods</p>
            <p className="text-3xl font-bold text-green-400">{publishedMods}</p>
          </div>
          <div className="bg-gray-900/80 backdrop-blur border border-gray-700 p-6 rounded-lg">
            <p className="text-gray-400 text-sm">Pending Mods</p>
            <p className="text-3xl font-bold text-yellow-400">{pendingCount}</p>
          </div>
        </div>

        {/* Pending Mods Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-emerald-500 mb-6">⏳ Pending Mods for Review ({pendingCount})</h2>
          
          {pendingCount === 0 ? (
            <div className="bg-gray-900/80 backdrop-blur border border-gray-700 p-8 rounded-lg text-center">
              <p className="text-gray-400 text-lg">✅ No pending mods. All clear!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingMods.map((mod) => (
                <div key={mod.id} className="bg-gray-900/80 backdrop-blur border border-gray-700 p-6 rounded-lg flex justify-between items-start gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-emerald-400 mb-2">{mod.title}</h3>
                    <p className="text-gray-400 text-sm mb-2">by <span className="text-blue-400">{mod.author.name || "Anonymous"}</span> ({mod.author.email})</p>
                    <p className="text-gray-300 mb-3 bg-black/30 p-3 rounded text-sm">{mod.description}</p>
                    <div className="text-xs text-gray-500">
                      📎 <a href={mod.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        Download Link
                      </a>
                    </div>
                  </div>
                  
                  {/* Client Component für die Buttons */}
                  <AdminControls modId={mod.id} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Banned Users Section */}
        {bannedUsers > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-red-500 mb-6">🚫 Banned Users ({bannedUsers})</h2>
            
            <div className="space-y-3">
              {banned.map((user) => (
                <div key={user.id} className="bg-red-900/20 backdrop-blur border border-red-700 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-bold text-red-400">{user.name || "Anonymous"}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                    {user.banReason && <p className="text-gray-500 text-xs mt-1">Reason: {user.banReason}</p>}
                    {user.bannedAt && <p className="text-gray-500 text-xs">Banned: {new Date(user.bannedAt).toLocaleDateString()}</p>}
                  </div>
                  <button 
                    onClick={async () => {
                      await fetch("/api/admin/ban", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: user.id, action: "unban" })
                      });
                      window.location.reload();
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded font-bold text-sm"
                  >
                    ✅ Unban
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

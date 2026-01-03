import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AdminControls from "../../components/AdminControls"; // Das bauen wir gleich als Client Component

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

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold text-red-500 mb-8">🛡️ Admin Command Center</h1>
      
      <div className="space-y-4">
        {pendingMods.length === 0 && <p className="text-gray-500">No pending mods. All clear!</p>}

        {pendingMods.map((mod) => (
          <div key={mod.id} className="bg-gray-900 border border-gray-700 p-6 rounded-lg flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-emerald-400">{mod.title}</h2>
                <p className="text-gray-400 text-sm mb-2">by {mod.author.name} ({mod.author.email})</p>
                <p className="text-gray-300 mb-4 bg-black/50 p-2 rounded text-sm">{mod.description}</p>
                <div className="text-xs text-blue-400">Link: {mod.downloadUrl}</div>
            </div>
            
            {/* Client Component für die Buttons */}
            <AdminControls modId={mod.id} />
          </div>
        ))}
      </div>
    </main>
  );
}
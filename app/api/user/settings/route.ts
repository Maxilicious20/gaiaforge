import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username, bgImage } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const dataToUpdate: any = {};

  // HINTERGRUND ÄNDERN
  if (bgImage) {
    dataToUpdate.backgroundImage = bgImage;
  }

  // USERNAME ÄNDERN (Mit 3-Tage Sperre)
  if (username && username !== user.username) {
    // Check ob Name vergeben ist
    const taken = await prisma.user.findUnique({ where: { username } });
    if (taken) return NextResponse.json({ error: "Username already taken" }, { status: 400 });

    // Check Zeit
    if (user.lastUsernameChange) {
      const daysSinceChange = (new Date().getTime() - new Date(user.lastUsernameChange).getTime()) / (1000 * 3600 * 24);
      if (daysSinceChange < 3) {
        return NextResponse.json({ error: "You can only change your username every 3 days." }, { status: 403 });
      }
    }
    
    dataToUpdate.username = username;
    dataToUpdate.lastUsernameChange = new Date();
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: dataToUpdate,
  });

  return NextResponse.json({ success: true });
}
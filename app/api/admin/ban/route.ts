import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();
const ADMIN_EMAIL = "emergencyhessen@gmail.com";

export async function POST(req: Request) {
  // @ts-ignore
  const session = await getServerSession(authOptions);

  if (!session || session.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Access Denied" }, { status: 403 });
  }

  try {
    const { userId, action, reason } = await req.json();

    if (action === "ban") {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          isBanned: true,
          banReason: reason || "Banned by admin",
          bannedAt: new Date()
        },
      });

      // Delete all sessions for this user
      await prisma.session.deleteMany({
        where: { userId },
      });

      return NextResponse.json({ success: true, message: "User banned" });
    }

    if (action === "unban") {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          isBanned: false,
          banReason: null,
          bannedAt: null
        },
      });
      return NextResponse.json({ success: true, message: "User unbanned" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Ban action error:", error);
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 });
  }
}

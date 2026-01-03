import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// HIER DEINE E-MAIL EINTRAGEN
const ADMIN_EMAIL = "emergencyhessen@gmail.com";

export async function POST(req: Request) {
  // @ts-ignore
  const session = await getServerSession(authOptions);

  if (!session || session.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Access Denied. You are not the Admin." }, { status: 403 });
  }

  const { modId, action } = await req.json(); // action = "approve" oder "reject"

  if (action === "approve") {
    await prisma.mod.update({
      where: { id: modId },
      data: { published: true },
    });
    return NextResponse.json({ success: true, message: "Mod Published!" });
  } 
  
  if (action === "reject") {
    // Bei Reject löschen wir sie einfach oder setzen status auf rejected (hier: löschen)
    await prisma.mod.delete({
      where: { id: modId },
    });
    return NextResponse.json({ success: true, message: "Mod Rejected and Deleted." });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
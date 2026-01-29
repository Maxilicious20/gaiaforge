import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ modId: string }> }
) {
  try {
    const { modId } = await params;
    const mod = await prisma.mod.findUnique({
      where: { id: modId },
      include: { author: true }
    });

    if (!mod) {
      return NextResponse.json({ error: "Mod not found" }, { status: 404 });
    }

    return NextResponse.json(mod);
  } catch (error) {
    console.error("Get mod error:", error);
    return NextResponse.json({ error: "Failed to fetch mod" }, { status: 500 });
  }
}

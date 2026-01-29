import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { modId: string } }
) {
  try {
    const mod = await prisma.mod.findUnique({
      where: { id: params.modId },
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

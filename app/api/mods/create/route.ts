import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  // 1. Sicherheit: Ist der User eingeloggt?
  // @ts-ignore
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized. Please login." }, { status: 401 });
  }

  try {
    // 2. Daten empfangen
    const body = await req.json();
    const { title, description, category, downloadUrl, imageUrl } = body;

    // 3. Validierung: Fehlt was Wichtiges?
    if (!title || !description || !category || !downloadUrl) {
      return NextResponse.json({ error: "Missing required fields (Title, Description, Category or URL)" }, { status: 400 });
    }

    // 4. Den echten User aus der Datenbank holen (wir brauchen die ID)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    // 5. Mod in der Datenbank erstellen
    const newMod = await prisma.mod.create({
      data: {
        title,
        description,
        category,
        downloadUrl, // Der Link zu Google Drive / Dropbox etc.
        imageUrl: imageUrl || "", // Optionales Bild
        published: false, // Standardmäßig: nicht veröffentlicht
        authorId: user.id, // Verknüpfung zum User
      },
    });

    return NextResponse.json({ success: true, modId: newMod.id });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
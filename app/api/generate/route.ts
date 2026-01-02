import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/route"; // Importiere deine Auth Config

const prisma = new PrismaClient();

export async function POST(req: Request) {
  // 1. Session prüfen (Ist der User eingeloggt?)
  const session = await getServerSession(authOptions);
  
  // Alternative Methode um Session zu holen, falls authOptions Import zickt:
  // const session = await getServerSession(); 

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. User aus Datenbank holen (um aktuelle Credits zu prüfen)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 3. Credits prüfen
  if (user.credits <= 0) {
    return NextResponse.json({ error: "Not enough credits. You receive 6 free credits monthly." }, { status: 403 });
  }

  // 4. Request Daten lesen
  const body = await req.json();
  const { prompt, category } = body;

  // --- ANFANG KI CODE (DEAKTIVIERT) ---
  /*
  // Hier kommt später der echte Call hin, wenn Hytale draußen ist.
  // Aktuell deaktiviert, da wir keine echten APIs haben.
  
  const aiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
     method: "POST",
     body: JSON.stringify({
        contents: [{
            parts: [{
                text: `Generate a Hytale ${category} JSON for: ${prompt}. Use the official schema.`
            }]
        }]
     })
  });
  const aiData = await aiResponse.json();
  */
  // --- ENDE KI CODE ---

  // 5. Credit abziehen (Wir ziehen trotzdem ab, um das System zu simulieren)
  // Bei deinem Admin-Account (999999) ist das egal, bei anderen zählt es runter.
  const updatedUser = await prisma.user.update({
    where: { email: user.email! },
    data: { credits: user.credits - 1 },
  });

  // 6. Antwort zurückgeben
  return NextResponse.json({
    success: true,
    credits: updatedUser.credits,
    message: `Request registered for category: ${category.toUpperCase()}.\n\nNOTE: Actual generation is paused until Hytale Early Access Release to prevent generating broken/invalid code. Your prompt has been logged.`,
  });
}
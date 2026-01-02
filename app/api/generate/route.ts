import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  // 1. Session prüfen (Sicherheit)
  // @ts-ignore
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Sicherstellen, dass der API-Key gesetzt ist (vermeidet schwer zu findende Laufzeitfehler)
  if (!process.env.GOOGLE_API_KEY) {
    console.error("Missing GOOGLE_API_KEY environment variable");
    return NextResponse.json({ error: "Missing GOOGLE_API_KEY environment variable." }, { status: 500 });
  }

  // GoogleGenerativeAI erst hier erzeugen, damit die Umgebungsvariablen sicher geladen sind
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

  // 2. Credits prüfen
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || user.credits <= 0) {
    return NextResponse.json({ error: "Not enough credits." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { prompt, category } = body;

    // --- RAG LOGIK START ---

    // A. Embeddings für die Frage erstellen (Was sucht der User?)
    // Wichtig: Wir nutzen dasselbe Modell wie beim Training (text-embedding-004)
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const embeddingResult = await embeddingModel.embedContent(prompt);
    const vector = embeddingResult.embedding.values;
    
    // Vektor für SQL formatieren
    const vectorString = `[${vector.join(",")}]`;

    // B. Die Datenbank nach Wissen fragen (Vektor-Suche)
    // Wir suchen die 3 passendsten Textstellen aus unserer KnowledgeBase
    // "ORDER BY embedding <=> vector" bedeutet: Finde, was mathematisch am nächsten liegt.
    const relevantDocs = await prisma.$queryRaw`
      SELECT content, source
      FROM "KnowledgeBase"
      ORDER BY embedding <=> ${vectorString}::vector
      LIMIT 3;
    ` as any[];

    // C. Das Wissen zusammenbauen (Kontext)
    const contextText = relevantDocs.map(doc => `SOURCE (${doc.source}):\n${doc.content}`).join("\n\n");

    // D. Den "Lehrer" instruieren (System Prompt)
    const tutorPrompt = `
      Du bist der GaiaForge Mentor für Hytale Modding.
      
      DEINE MISSION:
      Der User möchte etwas über "${category}" wissen.
      Erstelle einen LERNPLAN / BLUEPRINT, wie er das umsetzen kann.
      
      DEINE REGELN:
      1. Nutze für Fakten NUR den folgenden KONTEXT (Offizielle Hytale Docs).
      2. Wenn im Kontext nichts dazu steht, sage ehrlich, dass es dazu noch keine offiziellen Infos gibt. Erfinde NICHTS.
      3. Gib KEINEN fertigen Code zum Kopieren. Zeige nur Schnipsel als Beispiele.
      4. Erkläre die Logik (z.B. "Du brauchst eine JSON Datei, darin das Feld X...").
      
      HIER IST DER KONTEXT (WISSEN):
      ${contextText}

      USER FRAGE:
      ${prompt}
    `;

    // E. Die Antwort generieren
    // Versuche zuerst das gewünschte Modell, bei 404 (nicht verfügbar) nutze Fallbacks.
    const preferredModels = ["gemini-1.5-pro", "gemini-1.5", "text-bison-001", "models/text-bison-001", "chat-bison-001"];
    let answer = "";
    let lastError: any = null;

    for (const m of preferredModels) {
      try {
        const candidate = genAI.getGenerativeModel({ model: m });
        const res = await candidate.generateContent(tutorPrompt);
        answer = res.response?.text ? res.response.text() : String(res);
        break;
      } catch (err) {
        lastError = err;
        // Wenn 404: Modell nicht verfügbar für diese API-Version, probiere nächsten
        const status = (err && typeof err === "object" && "status" in err) ? (err as any).status : null;
        if (status !== 404) {
          // Nicht-404 Fehler — breche ab und wir geben den Fehler weiter
          throw err;
        }
        console.warn(`Model ${m} not available, trying next fallback.`);
      }
    }

    if (!answer) {
      // Liste Modelle (nur zu Debugging in non-production)
      try {
        const modelsList = await genAI.listModels();
        console.error("Available models:", modelsList);
        if (process.env.NODE_ENV !== "production") {
          return NextResponse.json({ error: "Failed to generate blueprint.", details: (lastError && lastError.message) || String(lastError), availableModels: modelsList }, { status: 500 });
        }
      } catch (listErr) {
        console.error("Failed to list models:", listErr);
      }
      throw lastError || new Error("No model produced a response");
    }

    // --- RAG LOGIK ENDE ---

    // 3. Credits abziehen
    const updatedUser = await prisma.user.update({
      where: { email: user.email as string },
      data: { credits: user.credits - 1 },
    });

    return NextResponse.json({
      success: true,
      credits: updatedUser.credits,
      message: answer, // Das ist jetzt der echte KI-Text!
    });

  } catch (error) {
    console.error("AI Error:", error);
    // Für Debugging: Gebe die Fehlermeldung nur in non-production zurück.
    const message = error && typeof error === "object" && "message" in error ? (error as any).message : String(error);
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({ error: "Failed to generate blueprint.", details: message }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to generate blueprint." }, { status: 500 });
  }
}
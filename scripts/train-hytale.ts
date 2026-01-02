import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Umgebungsvariablen laden
dotenv.config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// Ordner mit den Docs
const DOCS_DIR = path.join(process.cwd(), "hytale-docs");

async function main() {
  console.log("🚀 Starte Training (Datenbank-Fütterung)...");

  // 1. Dateien lesen
  if (!fs.existsSync(DOCS_DIR)) {
    console.error("❌ Ordner 'hytale-docs' nicht gefunden!");
    return;
  }

  const files = fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith(".txt"));
  console.log(`📂 Gefundene Dateien: ${files.length}`);

 const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

  for (const file of files) {
    console.log(`➡️ Verarbeite: ${file}`);
    const filePath = path.join(DOCS_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");

    // 2. Text in Vektor umwandeln (Embeddings)
    // Wir teilen den Text hier simpel, für echte Docs bräuchte man einen "Chunker".
    // Für jetzt nehmen wir die ganze Datei als ein Stück.
    const result = await model.embedContent(content);
    const vector = result.embedding.values; // Das ist der Zahlen-Code!

    console.log(`🧠 Vektor generiert (${vector.length} Dimensionen)`);

    // 3. In Datenbank speichern (SQL Raw nötig für Vektoren)
    // Wir müssen den Vektor als String formatieren: "[0.1, 0.2, ...]"
    const vectorString = `[${vector.join(",")}]`;

    await prisma.$executeRaw`
      INSERT INTO "KnowledgeBase" (id, content, source, embedding, "createdAt")
      VALUES (gen_random_uuid(), ${content}, ${file}, ${vectorString}::vector, NOW())
    `;

    console.log("✅ Gespeichert!");
  }

  console.log("🏁 Training abgeschlossen!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
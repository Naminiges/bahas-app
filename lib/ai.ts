import { google } from "@ai-sdk/google"
import { generateObject, generateText } from "ai"
import { z } from "zod"

// Model 3.x Flash: kualitas mendekati Pro, kuota free tier lebih lega dari 2.0.
// Kalau masih kena limit token, ganti ke "gemini-3.5-flash-lite" (throughput lebih tinggi, lebih murah).
const model = google("gemini-3.5-flash")

// (1) CLASSIFY + (2) GENERATE
export async function analyzeScenario(input: {
  situation: string
  relation: string
  fear?: string
}) {
  const { object } = await generateObject({
    model,
    schema: z.object({
      topic: z.string(),
      cultural_note: z.string(),
      opening_script: z.string(),
      predicted_reactions: z
        .array(z.object({ reaksi: z.string(), saran_respons: z.string() }))
        .max(3),
    }),
    system:
      "Kamu pelatih komunikasi keluarga Indonesia. Bantu user membahas uang tanpa drama. " +
      "Sadar konteks budaya (uang panai, warisan, gengsi, 'rezeki diganti'). " +
      "Naskah singkat, hangat, tidak menuduh, pakai 'aku' bukan 'kamu selalu'.",
    prompt: `Relasi: ${input.relation}\nSituasi: ${input.situation}\nKetakutan user: ${input.fear ?? "-"}`,
  })
  return object
}

// (3) ACT: AI memerankan lawan bicara
export async function roleplayReply(input: {
  relation: string
  difficulty: "kalem" | "emosian"
  situation: string
  history: { role: "user" | "assistant"; content: string }[]
  userMessage: string
}) {
  const { text } = await generateText({
    model,
    system:
      `Kamu MEMERANKAN ${input.relation} dari user dalam latihan obrolan uang. ` +
      `Situasi: ${input.situation}. ` +
      `Sifat: ${input.difficulty === "emosian" ? "mudah tersinggung, defensif" : "tenang tapi punya ego"}. ` +
      "Balas natural sebagai orang itu (1-3 kalimat, bahasa sehari-hari). " +
      "JANGAN keluar karakter. JANGAN memberi nasihat sebagai AI.",
    messages: [...input.history, { role: "user", content: input.userMessage }],
  })
  return text
}

// (4) SCORE
export async function scoreConversation(
  messages: { role: string; content: string }[],
) {
  const { object } = await generateObject({
    model,
    schema: z.object({
      drama_score: z.number().min(0).max(100),
      triggers: z.array(z.string()).max(3),
      deescalators: z.array(z.string()).max(3),
      improvement: z.string(),
    }),
    system:
      "Nilai percakapan uang keluarga. drama_score: 0=sangat adem, 100=meledak. " +
      "triggers=kalimat USER yang memicu drama. deescalators=kalimat USER yang menenangkan. " +
      "improvement=satu saran utama, konkret.",
    prompt: JSON.stringify(messages),
  })
  return object
}

// (5) TRANSFORM
export async function rewriteTone(input: { text: string; relation: string }) {
  const { object } = await generateObject({
    model,
    schema: z.object({ rewritten: z.string(), note: z.string() }),
    system:
      "Tulis ulang pesan agar sopan, tidak menuduh, minim drama, konteks keluarga Indonesia. " +
      "note=jelaskan singkat apa yang diubah & kenapa.",
    prompt: `Ke: ${input.relation}\nPesan asli: ${input.text}`,
  })
  return object
}

// (SAFETY) deteksi kata risiko tanpa AI (murah & pasti)
const RISK = ["bunuh diri", "mengakhiri hidup", "kdrt", "dipukul", "kekerasan", "mengancam"]
export function checkRisk(text: string) {
  const hit = RISK.some((k) => text.toLowerCase().includes(k))
  return {
    risky: hit,
    resource: hit
      ? "Kalau ada ancaman/kekerasan, hubungi SAPA 129 atau 119 ext 8. Bahas bukan pengganti bantuan profesional."
      : null,
  }
}
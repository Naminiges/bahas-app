import { NextResponse } from "next/server"
import { z } from "zod"
import { scoreConversation } from "@/lib/ai"
import { hitRateLimit } from "@/lib/rate-limit"
import { createClient } from "@/lib/supabase/server"

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1),
})

const requestSchema = z.object({
  scenario_id: z.string().uuid().nullable().optional(),
  difficulty: z.enum(["kalem", "emosian"]).default("kalem"),
  messages: z.array(messageSchema).min(1),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const rate = hitRateLimit(`feedback:${user.id}`)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "terlalu banyak permintaan", retryAfter: rate.retryAfter },
      { status: 429 },
    )
  }

  const parsed = requestSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "messages wajib diisi" }, { status: 400 })
  }

  const feedback = await scoreConversation(parsed.data.messages)
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      scenario_id: parsed.data.scenario_id ?? null,
      difficulty: parsed.data.difficulty,
      messages: parsed.data.messages,
      drama_score: feedback.drama_score,
      feedback,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ conversation: data, feedback })
}

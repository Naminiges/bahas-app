import { NextResponse } from "next/server"
import { z } from "zod"
import { roleplayReply, checkRisk } from "@/lib/ai"
import { hitRateLimit } from "@/lib/rate-limit"
import { createClient } from "@/lib/supabase/server"

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1),
})

const requestSchema = z.object({
  relation: z.string().trim().min(1),
  difficulty: z.enum(["kalem", "emosian"]).default("kalem"),
  situation: z.string().trim().min(1),
  history: z.array(messageSchema).default([]),
  userMessage: z.string().trim().min(1),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const rate = hitRateLimit(`roleplay:${user.id}`)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "terlalu banyak permintaan", retryAfter: rate.retryAfter },
      { status: 429 },
    )
  }

  const parsed = requestSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "input roleplay tidak valid" }, { status: 400 })
  }

  const risk = checkRisk(parsed.data.userMessage)
  if (risk.risky) {
    return NextResponse.json({ reply: null, risk })
  }

  const reply = await roleplayReply(parsed.data)
  return NextResponse.json({ reply, risk })
}

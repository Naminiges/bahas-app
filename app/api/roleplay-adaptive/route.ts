import { NextResponse } from "next/server"
import { z } from "zod"
import { checkRisk, roleplayReplyAdaptive } from "@/lib/ai"
import { hitRateLimit } from "@/lib/rate-limit"
import { createClient } from "@/lib/supabase/server"

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1),
})

const requestSchema = z.object({
  relation: z.string().trim().min(1),
  situation: z.string().trim().min(1),
  history: z.array(messageSchema).default([]),
  userMessage: z.string().trim().min(1),
  dramaSoFar: z.number().int().min(0).max(100).default(40),
  turn: z.number().int().min(1).default(1),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const rate = hitRateLimit(`roleplay-adaptive:${user.id}`)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "terlalu banyak permintaan", retryAfter: rate.retryAfter },
      { status: 429 },
    )
  }

  const parsed = requestSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "input roleplay adaptif tidak valid" }, { status: 400 })
  }

  const risk = checkRisk(parsed.data.userMessage)
  if (risk.risky) {
    return NextResponse.json({ reply: null, risk })
  }

  const reply = await roleplayReplyAdaptive(parsed.data)
  return NextResponse.json({ reply, risk })
}

import { NextResponse } from "next/server"
import { z } from "zod"
import { draftRealMessage } from "@/lib/ai"
import { hitRateLimit } from "@/lib/rate-limit"
import { createClient } from "@/lib/supabase/server"

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1),
})

const requestSchema = z.object({
  conversationId: z.string().uuid().nullable().optional(),
  relation: z.string().trim().min(1),
  situation: z.string().trim().min(1),
  messages: z.array(messageSchema).min(1),
  feedback: z.unknown().optional(),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const rate = hitRateLimit(`summary:${user.id}`)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "terlalu banyak permintaan", retryAfter: rate.retryAfter },
      { status: 429 },
    )
  }

  const parsed = requestSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "input summary tidak valid" }, { status: 400 })
  }

  const draft = await draftRealMessage(parsed.data)

  if (parsed.data.conversationId) {
    const { error } = await supabase
      .from("conversations")
      .update({ summary_message: draft.message })
      .eq("id", parsed.data.conversationId)
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json(draft)
}

import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { analyzeScenario, checkRisk } from "@/lib/ai"
import { hitRateLimit } from "@/lib/rate-limit"

const requestSchema = z.object({
  situation: z.string().trim().min(1),
  relation: z.string().trim().min(1),
  fear: z.string().trim().optional(),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const rate = hitRateLimit(`scenario:${user.id}`)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "terlalu banyak permintaan", retryAfter: rate.retryAfter },
      { status: 429 },
    )
  }

  const parsed = requestSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "situation & relation wajib" }, { status: 400 })
  }

  const { situation, relation, fear } = parsed.data
  const risk = checkRisk(`${situation} ${fear ?? ""}`)
  if (risk.risky) {
    return NextResponse.json({ scenario: null, risk })
  }

  const ai = await analyzeScenario({ situation, relation, fear })

  const { data, error } = await supabase
    .from("scenarios")
    .insert({
      relation, situation, fear,
      topic: ai.topic,
      cultural_note: ai.cultural_note,
      opening_script: ai.opening_script,
      predicted_reactions: ai.predicted_reactions,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ scenario: data, risk })
}

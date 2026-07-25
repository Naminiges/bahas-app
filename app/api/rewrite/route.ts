import { NextResponse } from "next/server"
import { z } from "zod"
import { rewriteTone, checkRisk } from "@/lib/ai"
import { hitRateLimit } from "@/lib/rate-limit"
import { createClient } from "@/lib/supabase/server"

const requestSchema = z.object({
  relation: z.string().trim().min(1),
  text: z.string().trim().min(1),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const rate = hitRateLimit(`rewrite:${user.id}`)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "terlalu banyak permintaan", retryAfter: rate.retryAfter },
      { status: 429 },
    )
  }

  const parsed = requestSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "text & relation wajib" }, { status: 400 })
  }

  const risk = checkRisk(parsed.data.text)
  if (risk.risky) {
    return NextResponse.json({ rewrite: null, risk })
  }

  const rewrite = await rewriteTone(parsed.data)
  return NextResponse.json({ rewrite, risk })
}

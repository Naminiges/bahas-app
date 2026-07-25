import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { analyzeScenario, checkRisk } from "@/lib/ai"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { situation, relation, fear } = await req.json()
  if (!situation || !relation) {
    return NextResponse.json({ error: "situation & relation wajib" }, { status: 400 })
  }

  const risk = checkRisk(`${situation} ${fear ?? ""}`)
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
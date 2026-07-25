"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

type Tab = "prepare" | "practice" | "rewrite"
type Difficulty = "kalem" | "emosian"

type Risk = {
  risky: boolean
  resource: string | null
}

type Reaction = {
  reaksi: string
  saran_respons: string
}

type Scenario = {
  id: string
  relation: string
  topic: string | null
  situation: string
  fear: string | null
  cultural_note: string | null
  opening_script: string | null
  predicted_reactions: Reaction[] | null
  created_at: string
}

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type Feedback = {
  drama_score: number
  triggers: string[]
  deescalators: string[]
  improvement: string
}

type SavedLine = {
  id: string
  text: string
  source: string | null
  created_at: string
}

type ConversationSummary = {
  id: string
  difficulty: Difficulty
  drama_score: number | null
  feedback: Feedback | null
  created_at: string
}

type ScenarioResponse = {
  scenario: Scenario | null
  risk: Risk
}

type RoleplayResponse = {
  reply: string | null
  risk: Risk
}

type FeedbackResponse = {
  conversation: ConversationSummary
  feedback: Feedback
}

type RewriteResponse = {
  rewrite: { rewritten: string; note: string } | null
  risk: Risk
}

const relations = ["orang tua", "pasangan", "saudara", "keluarga jauh"] as const
const tabs: { id: Tab; label: string }[] = [
  { id: "prepare", label: "Siapkan" },
  { id: "practice", label: "Latihan" },
  { id: "rewrite", label: "Terjemah nada" },
]

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = (await response.json().catch(() => ({}))) as { error?: string }
  if (!response.ok) {
    throw new Error(data.error ?? "Permintaan gagal diproses")
  }
  return data as T
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export default function Home() {
  const supabase = useMemo(() => createClient(), [])
  const [email, setEmail] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [loginStatus, setLoginStatus] = useState("")

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setCheckingAuth(false)
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setCheckingAuth(false)
    })
    return () => subscription.subscription.unsubscribe()
  }, [supabase])

  async function signIn() {
    setLoginStatus("")
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    setLoginStatus(error ? error.message : "Cek email untuk link login.")
  }

  if (checkingAuth) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f7f4] px-6 text-[#1f2520]">
        <p className="text-sm font-medium">Memeriksa sesi...</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f7f4] px-6 text-[#1f2520]">
        <section className="w-full max-w-md rounded-lg border border-[#d8ddd0] bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#c25534]">Bahas</p>
            <h1 className="text-3xl font-semibold">Latihan ngobrol uang, sebelum ngobrol beneran.</h1>
            <p className="text-sm leading-6 text-[#586151]">
              Masuk dengan magic link untuk menyimpan skenario, sesi latihan, dan kalimat andalan secara privat.
            </p>
          </div>
          <div className="mt-6 space-y-3">
            <label className="block text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="w-full rounded-md border border-[#cbd3c0] bg-white px-3 py-2 text-sm outline-none focus:border-[#2f6f4e] focus:ring-2 focus:ring-[#2f6f4e]/20"
              placeholder="nama@email.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button
              className="w-full rounded-md bg-[#1f2520] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#8d9388]"
              disabled={!email}
              onClick={signIn}
            >
              Kirim Link Login
            </button>
            {loginStatus ? <p className="text-sm text-[#586151]">{loginStatus}</p> : null}
          </div>
        </section>
      </main>
    )
  }

  return <BahasApp user={user} />
}

function BahasApp({ user }: { user: User }) {
  const supabase = useMemo(() => createClient(), [])
  const [activeTab, setActiveTab] = useState<Tab>("prepare")
  const [relation, setRelation] = useState<(typeof relations)[number]>("saudara")
  const [situation, setSituation] = useState("Adik pinjam uang terus tapi jarang mengembalikan.")
  const [fear, setFear] = useState("Takut dia tersinggung dan bilang aku pelit.")
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>("kalem")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [userMessage, setUserMessage] = useState("")
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [rewriteInput, setRewriteInput] = useState("Kamu tuh minjem uang terus, kapan balikin?")
  const [rewriteResult, setRewriteResult] = useState<{ rewritten: string; note: string } | null>(null)
  const [savedLines, setSavedLines] = useState<SavedLine[]>([])
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [saveLineText, setSaveLineText] = useState("")
  const [status, setStatus] = useState("")
  const [riskMessage, setRiskMessage] = useState("")
  const [busy, setBusy] = useState("")

  const refreshHistory = useCallback(async () => {
    const [lines, sessions] = await Promise.all([
      supabase
        .from("saved_lines")
        .select("id,text,source,created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("conversations")
        .select("id,difficulty,drama_score,feedback,created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ])
    if (lines.data) setSavedLines(lines.data as SavedLine[])
    if (sessions.data) setConversations(sessions.data as ConversationSummary[])
  }, [supabase])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshHistory()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [refreshHistory])

  function showRisk(risk: Risk) {
    setRiskMessage(risk.risky && risk.resource ? risk.resource : "")
  }

  async function createScenario() {
    setBusy("scenario")
    setStatus("")
    setRiskMessage("")
    try {
      const data = await postJson<ScenarioResponse>("/api/scenario", {
        relation,
        situation,
        fear,
      })
      showRisk(data.risk)
      if (data.scenario) {
        setScenario(data.scenario)
        setMessages([])
        setFeedback(null)
        setSaveLineText(data.scenario.opening_script ?? "")
        setStatus("Naskah siap. Kamu bisa lanjut latihan dari skenario ini.")
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Gagal membuat skenario")
    } finally {
      setBusy("")
    }
  }

  async function sendRoleplay() {
    if (!scenario || !userMessage.trim()) return
    const nextUserMessage: ChatMessage = { role: "user", content: userMessage.trim() }
    setBusy("roleplay")
    setStatus("")
    setRiskMessage("")
    setUserMessage("")
    try {
      const data = await postJson<RoleplayResponse>("/api/roleplay", {
        relation: scenario.relation,
        difficulty,
        situation: scenario.situation,
        history: messages,
        userMessage: nextUserMessage.content,
      })
      showRisk(data.risk)
      const nextMessages = data.reply
        ? [...messages, nextUserMessage, { role: "assistant" as const, content: data.reply }]
        : [...messages, nextUserMessage]
      setMessages(nextMessages)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Gagal mengirim latihan")
      setUserMessage(nextUserMessage.content)
    } finally {
      setBusy("")
    }
  }

  async function finishSession() {
    if (!scenario || messages.length === 0) return
    setBusy("feedback")
    setStatus("")
    try {
      const data = await postJson<FeedbackResponse>("/api/feedback", {
        scenario_id: scenario.id,
        difficulty,
        messages,
      })
      setFeedback(data.feedback)
      setSaveLineText(data.feedback.improvement)
      setStatus("Feedback tersimpan ke riwayat latihan.")
      await refreshHistory()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Gagal mengambil feedback")
    } finally {
      setBusy("")
    }
  }

  async function rewriteTone() {
    setBusy("rewrite")
    setStatus("")
    setRiskMessage("")
    try {
      const data = await postJson<RewriteResponse>("/api/rewrite", {
        relation,
        text: rewriteInput,
      })
      showRisk(data.risk)
      if (data.rewrite) {
        setRewriteResult(data.rewrite)
        setSaveLineText(data.rewrite.rewritten)
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Gagal menulis ulang nada")
    } finally {
      setBusy("")
    }
  }

  async function saveLine(text: string, source: string) {
    if (!text.trim()) return
    setBusy("save")
    setStatus("")
    const { error } = await supabase.from("saved_lines").insert({ text: text.trim(), source })
    setBusy("")
    if (error) {
      setStatus(error.message)
      return
    }
    setStatus("Kalimat andalan tersimpan.")
    setSaveLineText("")
    await refreshHistory()
  }

  const latestScore = conversations.find((item) => typeof item.drama_score === "number")?.drama_score ?? null

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#1f2520]">
      <header className="border-b border-[#d8ddd0] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#c25534]">Bahas</p>
            <h1 className="text-2xl font-semibold">Latihan ngobrol uang, sebelum ngobrol beneran.</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#586151]">
            <span className="max-w-[220px] truncate">{user.email}</span>
            <button
              className="rounded-md border border-[#cbd3c0] px-3 py-2 font-medium text-[#1f2520] hover:bg-[#eef1ea]"
              onClick={() => supabase.auth.signOut()}
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-5">
          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`rounded-md border px-4 py-2 text-sm font-semibold ${
                  activeTab === tab.id
                    ? "border-[#2f6f4e] bg-[#2f6f4e] text-white"
                    : "border-[#cbd3c0] bg-white text-[#1f2520] hover:bg-[#eef1ea]"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {riskMessage ? (
            <div className="rounded-lg border border-[#d8876d] bg-[#fff2ed] p-4 text-sm leading-6 text-[#7b2d17]">
              {riskMessage}
            </div>
          ) : null}
          {status ? (
            <div className="rounded-lg border border-[#d8ddd0] bg-white p-4 text-sm text-[#586151]">{status}</div>
          ) : null}

          {activeTab === "prepare" ? (
            <section className="rounded-lg border border-[#d8ddd0] bg-white p-5 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">
                  Relasi
                  <select
                    className="w-full rounded-md border border-[#cbd3c0] bg-white px-3 py-2 outline-none focus:border-[#2f6f4e] focus:ring-2 focus:ring-[#2f6f4e]/20"
                    value={relation}
                    onChange={(event) => setRelation(event.target.value as (typeof relations)[number])}
                  >
                    {relations.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Ketakutan utama
                  <input
                    className="w-full rounded-md border border-[#cbd3c0] bg-white px-3 py-2 outline-none focus:border-[#2f6f4e] focus:ring-2 focus:ring-[#2f6f4e]/20"
                    value={fear}
                    onChange={(event) => setFear(event.target.value)}
                  />
                </label>
              </div>
              <label className="mt-4 block space-y-2 text-sm font-medium">
                Situasi
                <textarea
                  className="min-h-32 w-full rounded-md border border-[#cbd3c0] bg-white px-3 py-2 outline-none focus:border-[#2f6f4e] focus:ring-2 focus:ring-[#2f6f4e]/20"
                  value={situation}
                  onChange={(event) => setSituation(event.target.value)}
                />
              </label>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="rounded-md bg-[#1f2520] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#8d9388]"
                  disabled={busy === "scenario" || !situation.trim()}
                  onClick={createScenario}
                >
                  {busy === "scenario" ? "Membuat..." : "Buat Naskah"}
                </button>
                {scenario ? (
                  <button
                    className="rounded-md border border-[#cbd3c0] px-4 py-2.5 text-sm font-semibold hover:bg-[#eef1ea]"
                    onClick={() => setActiveTab("practice")}
                  >
                    Latih Ini
                  </button>
                ) : null}
              </div>

              {scenario ? (
                <div className="mt-5 grid gap-4">
                  <ResultBlock title="Naskah pembuka" text={scenario.opening_script ?? "-"} />
                  <ResultBlock title="Catatan budaya" text={scenario.cultural_note ?? "-"} />
                  <div>
                    <h2 className="text-sm font-semibold">Prediksi reaksi</h2>
                    <div className="mt-2 grid gap-3">
                      {(scenario.predicted_reactions ?? []).map((item, index) => (
                        <article key={`${item.reaksi}-${index}`} className="rounded-lg border border-[#d8ddd0] p-4">
                          <p className="text-sm font-semibold">{item.reaksi}</p>
                          <p className="mt-1 text-sm leading-6 text-[#586151]">{item.saran_respons}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                  <button
                    className="w-fit rounded-md border border-[#2f6f4e] px-4 py-2 text-sm font-semibold text-[#2f6f4e] hover:bg-[#eaf4ed]"
                    onClick={() => saveLine(scenario.opening_script ?? "", "opening_script")}
                  >
                    Simpan Kalimat
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}

          {activeTab === "practice" ? (
            <section className="rounded-lg border border-[#d8ddd0] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Roleplay</h2>
                  <p className="text-sm text-[#586151]">
                    {scenario ? `${scenario.relation} - ${scenario.topic ?? "topik uang"}` : "Buat skenario dulu di tab Siapkan."}
                  </p>
                </div>
                <div className="flex rounded-md border border-[#cbd3c0] bg-[#eef1ea] p-1">
                  {(["kalem", "emosian"] as const).map((item) => (
                    <button
                      key={item}
                      className={`rounded px-3 py-1.5 text-sm font-semibold ${
                        difficulty === item ? "bg-white text-[#1f2520] shadow-sm" : "text-[#586151]"
                      }`}
                      onClick={() => setDifficulty(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 min-h-64 space-y-3 rounded-lg border border-[#d8ddd0] bg-[#fafbf8] p-4">
                {messages.length === 0 ? (
                  <p className="text-sm leading-6 text-[#586151]">
                    Mulai dengan naskah pembuka dari tab Siapkan, atau tulis versi kamu sendiri.
                  </p>
                ) : null}
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`max-w-[88%] rounded-lg px-3 py-2 text-sm leading-6 ${
                      message.role === "user"
                        ? "ml-auto bg-[#2f6f4e] text-white"
                        : "bg-white text-[#1f2520] ring-1 ring-[#d8ddd0]"
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  className="rounded-md border border-[#cbd3c0] bg-white px-3 py-2 text-sm outline-none focus:border-[#2f6f4e] focus:ring-2 focus:ring-[#2f6f4e]/20"
                  disabled={!scenario}
                  placeholder={scenario?.opening_script ?? "Tulis respons kamu"}
                  value={userMessage}
                  onChange={(event) => setUserMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void sendRoleplay()
                  }}
                />
                <button
                  className="rounded-md bg-[#1f2520] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#8d9388]"
                  disabled={!scenario || !userMessage.trim() || busy === "roleplay"}
                  onClick={sendRoleplay}
                >
                  {busy === "roleplay" ? "Mengirim..." : "Kirim"}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  className="rounded-md border border-[#cbd3c0] px-4 py-2 text-sm font-semibold hover:bg-[#eef1ea]"
                  disabled={!scenario?.opening_script}
                  onClick={() => setUserMessage(scenario?.opening_script ?? "")}
                >
                  Pakai Naskah
                </button>
                <button
                  className="rounded-md border border-[#c25534] px-4 py-2 text-sm font-semibold text-[#a03d20] hover:bg-[#fff2ed] disabled:cursor-not-allowed disabled:border-[#d8ddd0] disabled:text-[#8d9388]"
                  disabled={!scenario || messages.length === 0 || busy === "feedback"}
                  onClick={finishSession}
                >
                  {busy === "feedback" ? "Menilai..." : "Akhiri dan Minta Feedback"}
                </button>
              </div>

              {feedback ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
                  <div className="rounded-lg border border-[#d8ddd0] bg-[#f6f7f4] p-4">
                    <p className="text-sm font-semibold text-[#586151]">Skor drama</p>
                    <p className="mt-2 text-4xl font-semibold text-[#c25534]">{feedback.drama_score}</p>
                    <p className="text-sm text-[#586151]">/100</p>
                  </div>
                  <div className="grid gap-3">
                    <ListBlock title="Pemicu" items={feedback.triggers} />
                    <ListBlock title="Peredam" items={feedback.deescalators} />
                    <ResultBlock title="Saran utama" text={feedback.improvement} />
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {activeTab === "rewrite" ? (
            <section className="rounded-lg border border-[#d8ddd0] bg-white p-5 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                <label className="space-y-2 text-sm font-medium">
                  Relasi
                  <select
                    className="w-full rounded-md border border-[#cbd3c0] bg-white px-3 py-2 outline-none focus:border-[#2f6f4e] focus:ring-2 focus:ring-[#2f6f4e]/20"
                    value={relation}
                    onChange={(event) => setRelation(event.target.value as (typeof relations)[number])}
                  >
                    {relations.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Pesan asli
                  <textarea
                    className="min-h-28 w-full rounded-md border border-[#cbd3c0] bg-white px-3 py-2 outline-none focus:border-[#2f6f4e] focus:ring-2 focus:ring-[#2f6f4e]/20"
                    value={rewriteInput}
                    onChange={(event) => setRewriteInput(event.target.value)}
                  />
                </label>
              </div>
              <button
                className="mt-4 rounded-md bg-[#1f2520] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#8d9388]"
                disabled={!rewriteInput.trim() || busy === "rewrite"}
                onClick={rewriteTone}
              >
                {busy === "rewrite" ? "Menulis..." : "Tulis Ulang"}
              </button>
              {rewriteResult ? (
                <div className="mt-5 grid gap-4">
                  <ResultBlock title="Versi aman" text={rewriteResult.rewritten} />
                  <ResultBlock title="Catatan" text={rewriteResult.note} />
                  <button
                    className="w-fit rounded-md border border-[#2f6f4e] px-4 py-2 text-sm font-semibold text-[#2f6f4e] hover:bg-[#eaf4ed]"
                    onClick={() => saveLine(rewriteResult.rewritten, "rewrite")}
                  >
                    Simpan Kalimat
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}
        </section>

        <aside className="space-y-5">
          <section className="rounded-lg border border-[#d8ddd0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Kemajuan</h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Metric label="Sesi" value={conversations.length.toString()} />
              <Metric label="Skor" value={latestScore === null ? "-" : latestScore.toString()} />
              <Metric label="Kalimat" value={savedLines.length.toString()} />
            </div>
          </section>

          <section className="rounded-lg border border-[#d8ddd0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Kalimat Andalan</h2>
            <div className="mt-4 space-y-3">
              <textarea
                className="min-h-20 w-full rounded-md border border-[#cbd3c0] px-3 py-2 text-sm outline-none focus:border-[#2f6f4e] focus:ring-2 focus:ring-[#2f6f4e]/20"
                placeholder="Kalimat yang mau disimpan"
                value={saveLineText}
                onChange={(event) => setSaveLineText(event.target.value)}
              />
              <button
                className="w-full rounded-md border border-[#2f6f4e] px-4 py-2 text-sm font-semibold text-[#2f6f4e] hover:bg-[#eaf4ed] disabled:cursor-not-allowed disabled:border-[#d8ddd0] disabled:text-[#8d9388]"
                disabled={!saveLineText.trim() || busy === "save"}
                onClick={() => saveLine(saveLineText, "manual")}
              >
                Simpan
              </button>
              {savedLines.length === 0 ? <p className="text-sm text-[#586151]">Belum ada kalimat tersimpan.</p> : null}
              {savedLines.map((line) => (
                <article key={line.id} className="rounded-lg border border-[#d8ddd0] p-3">
                  <p className="text-sm leading-6">{line.text}</p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-[#8d9388]">{line.source ?? "manual"}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[#d8ddd0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Riwayat Latihan</h2>
            <div className="mt-4 space-y-3">
              {conversations.length === 0 ? <p className="text-sm text-[#586151]">Belum ada sesi selesai.</p> : null}
              {conversations.map((conversation) => (
                <article key={conversation.id} className="rounded-lg border border-[#d8ddd0] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{conversation.difficulty}</p>
                    <p className="text-sm font-semibold text-[#c25534]">{conversation.drama_score ?? "-"}/100</p>
                  </div>
                  <p className="mt-1 text-xs text-[#8d9388]">{formatDate(conversation.created_at)}</p>
                  {conversation.feedback?.improvement ? (
                    <p className="mt-2 text-sm leading-6 text-[#586151]">{conversation.feedback.improvement}</p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  )
}

function ResultBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-2 rounded-lg border border-[#d8ddd0] bg-[#fafbf8] p-4 text-sm leading-6 text-[#1f2520]">{text}</p>
    </div>
  )
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="mt-2 space-y-2">
        {items.length === 0 ? <li className="text-sm text-[#586151]">Tidak ada.</li> : null}
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="rounded-lg border border-[#d8ddd0] bg-[#fafbf8] p-3 text-sm leading-6">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#d8ddd0] bg-[#fafbf8] p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#8d9388]">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  )
}

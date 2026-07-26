"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { User } from "@supabase/supabase-js"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import longLogo from "./long-logo.svg"
import primaryLogo from "./primary-logo.svg"

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
  messages: ChatMessage[]
  summary_message: string | null
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

type SummaryResponse = {
  message: string
  catatan: string
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

function estimateDramaForAdaptive(message: string, difficulty: Difficulty, turn: number) {
  const lowered = message.toLowerCase()
  const tenseWords = ["selalu", "kapan", "harus", "pelit", "bohong", "capek", "kesal", "marah"]
  const calmWords = ["aku", "boleh", "bantu", "ngobrol", "paham", "bareng", "tenang"]
  const tenseHits = tenseWords.filter((word) => lowered.includes(word)).length
  const calmHits = calmWords.filter((word) => lowered.includes(word)).length
  const base = difficulty === "emosian" ? 54 : 38
  const estimated = base + tenseHits * 9 - calmHits * 5 + Math.min(turn * 3, 12)
  return Math.min(100, Math.max(0, Math.round(estimated)))
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
    const isRateLimited = error?.message.toLowerCase().includes("rate limit")
    setLoginStatus(
      error
        ? isRateLimited
          ? "Anda terkena limit email. Tunggu beberapa menit sampai 1 jam, lalu coba lagi."
          : error.message
        : "Cek email untuk link login.",
    )
  }

  if (checkingAuth) {
    return (
      <main className="app-shell grid place-items-center px-6">
        <div className="card-soft flex items-center gap-3">
          <Image className="logo-icon h-9 w-9" src={primaryLogo} alt="Bahas" priority />
          <p className="text-sm font-medium text-neutral-600">Memeriksa sesi...</p>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="app-shell grid place-items-center px-6 py-10">
        <section className="card-soft w-full max-w-md p-8">
          <div className="space-y-4">
            <Image className="logo-wordmark" src={longLogo} alt="Bahas" priority />
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">Bahas</p>
              <h1 className="text-4xl font-bold leading-tight tracking-[-0.03em] text-neutral-900">
                Latihan ngobrol uang, sebelum ngobrol beneran.
              </h1>
            </div>
            <p className="text-base leading-7 text-neutral-600">
              Masuk dengan magic link untuk menyimpan skenario, sesi latihan, dan kalimat andalan secara privat.
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              placeholder="nama@email.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button
              className="btn btn-primary w-full"
              disabled={!email}
              onClick={signIn}
            >
              Kirim Link Login
            </button>
            <Link className="btn btn-secondary w-full" href="/demo">
              Coba Demo Tanpa Login
            </Link>
            {loginStatus ? <p className="status-callout text-sm">{loginStatus}</p> : null}
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
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [summaryResult, setSummaryResult] = useState<SummaryResponse | null>(null)
  const [copyStatus, setCopyStatus] = useState("")
  const [adaptiveMode, setAdaptiveMode] = useState(false)
  const [rewriteInput, setRewriteInput] = useState("Kamu tuh minjem uang terus, kapan balikin?")
  const [rewriteResult, setRewriteResult] = useState<{ rewritten: string; note: string } | null>(null)
  const [savedLines, setSavedLines] = useState<SavedLine[]>([])
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [saveLineText, setSaveLineText] = useState("")
  const [status, setStatus] = useState("")
  const [riskMessage, setRiskMessage] = useState("")
  const [busy, setBusy] = useState("")
  const [accountOpen, setAccountOpen] = useState(false)
  const [signOutOpen, setSignOutOpen] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<ConversationSummary | null>(null)

  const refreshHistory = useCallback(async () => {
    const [lines, sessions] = await Promise.all([
      supabase
        .from("saved_lines")
        .select("id,text,source,created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("conversations")
        .select("id,difficulty,drama_score,feedback,messages,summary_message,created_at")
        .order("created_at", { ascending: false })
        .limit(20),
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
        setConversationId(null)
        setSummaryResult(null)
        setCopyStatus("")
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
      const turn = messages.filter((message) => message.role === "user").length + 1
      const data = await postJson<RoleplayResponse>(
        adaptiveMode ? "/api/roleplay-adaptive" : "/api/roleplay",
        adaptiveMode
          ? {
              relation: scenario.relation,
              situation: scenario.situation,
              history: messages,
              userMessage: nextUserMessage.content,
              dramaSoFar: estimateDramaForAdaptive(nextUserMessage.content, difficulty, turn),
              turn,
            }
          : {
              relation: scenario.relation,
              difficulty,
              situation: scenario.situation,
              history: messages,
              userMessage: nextUserMessage.content,
            },
      )
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
      setConversationId(data.conversation.id)
      setSummaryResult(null)
      setCopyStatus("")
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

  async function createSummaryMessage() {
    if (!scenario || !feedback || messages.length === 0) return
    setBusy("summary")
    setStatus("")
    setCopyStatus("")
    try {
      const data = await postJson<SummaryResponse>("/api/summary", {
        conversationId,
        relation: scenario.relation,
        situation: scenario.situation,
        messages,
        feedback,
      })
      setSummaryResult(data)
      setSaveLineText(data.message)
      setStatus("Pesan siap kirim sudah dibuat.")
      await refreshHistory()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Gagal membuat pesan siap kirim")
    } finally {
      setBusy("")
    }
  }

  async function copySummaryMessage() {
    if (!summaryResult?.message) return
    try {
      await navigator.clipboard.writeText(summaryResult.message)
      setCopyStatus("Pesan disalin.")
    } catch {
      setCopyStatus("Gagal menyalin otomatis. Salin manual dari teks di atas.")
    }
  }

  function requestSignOut() {
    setAccountOpen(false)
    setSignOutOpen(true)
  }

  async function confirmSignOut() {
    setBusy("signout")
    setStatus("")
    const { error } = await supabase.auth.signOut()
    if (error) {
      setStatus(error.message)
      setBusy("")
      setSignOutOpen(false)
    }
  }

  const latestScore = conversations.find((item) => typeof item.drama_score === "number")?.drama_score ?? null

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <Image className="logo-icon" src={primaryLogo} alt="Bahas" priority />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-700">Bahas</p>
              <h1 className="text-xl font-semibold tracking-[-0.02em] text-neutral-900 sm:text-2xl">
                Latihan ngobrol uang, sebelum ngobrol beneran.
              </h1>
            </div>
          </div>
          <div className="relative flex flex-wrap items-center gap-3 text-sm text-neutral-500">
            <button
              className="flex max-w-[260px] items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-200 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-200"
              onClick={() => setAccountOpen((current) => !current)}
            >
              <span className="max-w-[190px] truncate">{user.email}</span>
              <span className="text-primary-700">{accountOpen ? "↑" : "↓"}</span>
            </button>
            {accountOpen ? (
              <div className="absolute right-0 top-12 z-30 w-64 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-neutral-100">
                <Link
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                  href="/progress"
                  onClick={() => setAccountOpen(false)}
                >
                  Kemajuan
                </Link>
                <button
                  className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-danger hover:bg-[#FEF2F2]"
                  onClick={requestSignOut}
                >
                  Keluar
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-6">
          <nav className="tabs-shell">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? "tab-button-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {riskMessage ? (
            <div className="callout-danger text-sm leading-6">
              <p className="font-semibold text-danger">Rujukan bantuan</p>
              <p className="mt-1">{riskMessage}</p>
            </div>
          ) : null}
          {status ? (
            <div className="status-callout text-sm">{status}</div>
          ) : null}

          {activeTab === "prepare" ? (
            <section className="card">
              <div className="mb-6 flex flex-col gap-2">
                <span className="chip chip-relation w-fit">Siapkan percakapan</span>
                <h2 className="text-2xl font-semibold tracking-[-0.02em] text-neutral-900">Buat titik mulai yang aman</h2>
                <p className="text-sm leading-6 text-neutral-500">
                  Ceritakan konteksnya, lalu Bahas menyusun naskah pembuka dan prediksi respons.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="field-label">Relasi</span>
                  <select
                    className="input"
                    value={relation}
                    onChange={(event) => setRelation(event.target.value as (typeof relations)[number])}
                  >
                    {relations.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="field-label">Ketakutan utama</span>
                  <input
                    className="input"
                    value={fear}
                    onChange={(event) => setFear(event.target.value)}
                  />
                </label>
              </div>
              <label className="mt-5 block space-y-2">
                <span className="field-label">Situasi</span>
                <textarea
                  className="input min-h-32 resize-y"
                  value={situation}
                  onChange={(event) => setSituation(event.target.value)}
                />
              </label>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className="btn btn-primary"
                  disabled={busy === "scenario" || !situation.trim()}
                  onClick={createScenario}
                >
                  {busy === "scenario" ? "Membuat..." : "Buat Naskah"}
                </button>
                {scenario ? (
                  <button
                    className="btn btn-secondary"
                    onClick={() => setActiveTab("practice")}
                  >
                    Latih Ini
                  </button>
                ) : null}
              </div>

              {scenario ? (
                <div className="mt-7 grid gap-5">
                  <ResultBlock title="Naskah pembuka" text={scenario.opening_script ?? "-"} />
                  <ResultBlock title="Catatan budaya" text={scenario.cultural_note ?? "-"} />
                  <div>
                    <h2 className="text-sm font-semibold text-neutral-800">Prediksi reaksi</h2>
                    <div className="mt-3 grid gap-3">
                      {(scenario.predicted_reactions ?? []).map((item, index) => (
                        <article key={`${item.reaksi}-${index}`} className="rounded-2xl bg-neutral-50 p-4 shadow-[inset_0_0_0_1px_var(--color-neutral-100)]">
                          <p className="text-sm font-semibold text-neutral-900">{item.reaksi}</p>
                          <p className="mt-1 text-sm leading-6 text-neutral-500">{item.saran_respons}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost w-fit"
                    onClick={() => saveLine(scenario.opening_script ?? "", "opening_script")}
                  >
                    Simpan Kalimat
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}

          {activeTab === "practice" ? (
            <section className="card">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-start">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className="chip chip-relation">{scenario?.relation ?? "Skenario"}</span>
                    <span className={`chip ${difficulty === "kalem" ? "chip-kalem" : "chip-emosian"}`}>{difficulty}</span>
                  </div>
                  <h2 className="text-2xl font-semibold tracking-[-0.02em] text-neutral-900">Roleplay</h2>
                  <p className="mt-1 max-w-2xl break-words text-sm leading-6 text-neutral-500">
                    {scenario ? `${scenario.relation} - ${scenario.topic ?? "topik uang"}` : "Buat skenario dulu di tab Siapkan."}
                  </p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-3 shadow-[inset_0_0_0_1px_var(--color-neutral-100)]">
                  <div className="grid grid-cols-2 gap-1 rounded-full bg-neutral-100 p-1 shadow-[inset_0_0_0_1px_rgba(203,209,219,0.48)]">
                    {(["kalem", "emosian"] as const).map((item) => (
                      <button
                        key={item}
                        className={`min-h-9 rounded-full px-3 text-sm font-semibold transition ${
                          difficulty === item
                            ? "bg-white text-primary-700 shadow-sm"
                            : "text-neutral-500 hover:text-neutral-700"
                        }`}
                        onClick={() => setDifficulty(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <label className="mt-3 flex min-h-10 items-center justify-between gap-3 rounded-xl bg-white px-3 text-sm font-semibold text-neutral-600 shadow-[inset_0_0_0_1px_var(--color-neutral-100)]">
                    <span>Mode adaptif</span>
                    <input
                      className="h-4 w-4 accent-primary-700"
                      type="checkbox"
                      checked={adaptiveMode}
                      onChange={(event) => setAdaptiveMode(event.target.checked)}
                    />
                  </label>
                </div>
              </div>

              <div className="mt-6 flex min-h-80 flex-col gap-4 rounded-[24px] bg-neutral-50 p-4 shadow-[inset_0_0_0_1px_var(--color-neutral-100)] sm:p-5">
                {messages.length === 0 ? (
                  <div className="m-auto max-w-sm text-center">
                    <Image className="logo-icon mx-auto mb-4 h-12 w-12" src={primaryLogo} alt="Bahas" />
                    <h3 className="text-lg font-semibold tracking-[-0.01em] text-neutral-900">Belum ada latihan</h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                      Mulai dengan naskah pembuka dari tab Siapkan, atau tulis versi kamu sendiri.
                    </p>
                  </div>
                ) : null}
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`bubble ${message.role === "user" ? "bubble-me" : "bubble-them"}`}
                  >
                    {message.content}
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  className="input"
                  disabled={!scenario}
                  placeholder={scenario?.opening_script ?? "Tulis respons kamu"}
                  value={userMessage}
                  onChange={(event) => setUserMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void sendRoleplay()
                  }}
                />
                <button
                  className="btn btn-primary"
                  disabled={!scenario || !userMessage.trim() || busy === "roleplay"}
                  onClick={sendRoleplay}
                >
                  {busy === "roleplay" ? "Mengirim..." : "Kirim"}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  className="btn btn-secondary"
                  disabled={!scenario?.opening_script}
                  onClick={() => setUserMessage(scenario?.opening_script ?? "")}
                >
                  Pakai Naskah
                </button>
                <button
                  className="btn btn-danger"
                  disabled={!scenario || messages.length === 0 || busy === "feedback"}
                  onClick={finishSession}
                >
                  {busy === "feedback" ? "Menilai..." : "Akhiri dan Minta Feedback"}
                </button>
              </div>

              {feedback ? (
                <div className="mt-6 space-y-5">
                  <div className="grid gap-5 rounded-[24px] bg-neutral-50 p-5 shadow-[inset_0_0_0_1px_var(--color-neutral-100)] sm:grid-cols-[200px_minmax(0,1fr)]">
                    <DramaMeter score={feedback.drama_score} />
                    <div className="grid gap-3">
                      <ListBlock title="Pemicu" items={feedback.triggers} />
                      <ListBlock title="Peredam" items={feedback.deescalators} />
                      <ResultBlock title="Saran utama" text={feedback.improvement} />
                    </div>
                  </div>

                  <div className="rounded-[24px] bg-primary-50 p-5 shadow-[inset_0_0_0_1px_var(--color-primary-100)]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold tracking-[-0.01em] text-primary-900">Pesan siap kirim</h3>
                        <p className="text-sm leading-6 text-primary-800">
                          Ringkas latihan dan feedback menjadi satu pesan yang bisa ditempel ke WhatsApp.
                        </p>
                      </div>
                      <button
                        className="btn btn-primary shrink-0"
                        disabled={busy === "summary"}
                        onClick={createSummaryMessage}
                      >
                        {busy === "summary" ? "Membuat..." : "Buatkan Pesan"}
                      </button>
                    </div>

                    {summaryResult ? (
                      <div className="mt-5 space-y-3">
                        <p className="rounded-2xl bg-white p-4 text-sm leading-6 text-neutral-800 shadow-sm">
                          {summaryResult.message}
                        </p>
                        <p className="text-sm leading-6 text-primary-800">{summaryResult.catatan}</p>
                        <div className="flex flex-wrap gap-3">
                          <button className="btn btn-secondary" onClick={copySummaryMessage}>
                            Salin
                          </button>
                          <button
                            className="btn btn-ghost"
                            onClick={() => saveLine(summaryResult.message, "summary_message")}
                          >
                            Simpan ke Kalimat Andalan
                          </button>
                        </div>
                        {copyStatus ? <p className="text-sm font-semibold text-primary-800">{copyStatus}</p> : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {activeTab === "rewrite" ? (
            <section className="card">
              <div className="mb-6 flex flex-col gap-2">
                <span className="chip chip-relation w-fit">Transform</span>
                <h2 className="text-2xl font-semibold tracking-[-0.02em] text-neutral-900">Terjemahkan nada pesan</h2>
                <p className="text-sm leading-6 text-neutral-500">
                  Ubah kalimat emosional menjadi versi yang lebih sopan, jelas, dan tidak menuduh.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                <label className="space-y-2">
                  <span className="field-label">Relasi</span>
                  <select
                    className="input"
                    value={relation}
                    onChange={(event) => setRelation(event.target.value as (typeof relations)[number])}
                  >
                    {relations.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="field-label">Pesan asli</span>
                  <textarea
                    className="input min-h-28 resize-y"
                    value={rewriteInput}
                    onChange={(event) => setRewriteInput(event.target.value)}
                  />
                </label>
              </div>
              <button
                className="btn btn-primary mt-5"
                disabled={!rewriteInput.trim() || busy === "rewrite"}
                onClick={rewriteTone}
              >
                {busy === "rewrite" ? "Menulis..." : "Tulis Ulang"}
              </button>
              {rewriteResult ? (
                <div className="mt-7 grid gap-5">
                  <ResultBlock title="Versi aman" text={rewriteResult.rewritten} />
                  <ResultBlock title="Catatan" text={rewriteResult.note} />
                  <button
                    className="btn btn-ghost w-fit"
                    onClick={() => saveLine(rewriteResult.rewritten, "rewrite")}
                  >
                    Simpan Kalimat
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}
        </section>

        <aside className="space-y-6">
          <section className="card">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-neutral-900">Kemajuan</h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Metric label="Sesi" value={conversations.length.toString()} />
              <Metric label="Skor" value={latestScore === null ? "-" : latestScore.toString()} />
              <Metric label="Kalimat" value={savedLines.length.toString()} />
            </div>
          </section>

          <section className="card">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-neutral-900">Kalimat Andalan</h2>
            <div className="mt-4 space-y-3">
              <textarea
                className="input min-h-24 resize-y text-sm"
                placeholder="Kalimat yang mau disimpan"
                value={saveLineText}
                onChange={(event) => setSaveLineText(event.target.value)}
              />
              <button
                className="btn btn-secondary w-full"
                disabled={!saveLineText.trim() || busy === "save"}
                onClick={() => saveLine(saveLineText, "manual")}
              >
                Simpan
              </button>
              {savedLines.length === 0 ? <p className="text-sm leading-6 text-neutral-500">Belum ada kalimat tersimpan.</p> : null}
              {savedLines.map((line) => (
                <article key={line.id} className="rounded-2xl bg-neutral-50 p-4 shadow-[inset_0_0_0_1px_var(--color-neutral-100)]">
                  <p className="text-sm leading-6 text-neutral-700">{line.text}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">{line.source ?? "manual"}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-neutral-900">Riwayat Latihan</h2>
                <p className="mt-1 text-sm leading-6 text-neutral-500">Buka sesi lama untuk melihat chat dan feedback.</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {conversations.length === 0 ? <p className="text-sm leading-6 text-neutral-500">Belum ada sesi selesai.</p> : null}
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  className="block w-full rounded-2xl bg-neutral-50 p-4 text-left shadow-[inset_0_0_0_1px_var(--color-neutral-100)] transition hover:bg-white hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-200"
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={`chip ${conversation.difficulty === "kalem" ? "chip-kalem" : "chip-emosian"}`}>
                      {conversation.difficulty}
                    </span>
                    <p className="font-mono text-sm font-semibold text-primary-700">{conversation.drama_score ?? "-"}/100</p>
                  </div>
                  <p className="mt-2 text-xs font-medium text-neutral-400">{formatDate(conversation.created_at)}</p>
                  {conversation.feedback?.improvement ? (
                    <p className="mt-2 text-sm leading-6 text-neutral-500">{conversation.feedback.improvement}</p>
                  ) : null}
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">Lihat detail sesi</p>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {signOutOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/45 px-4 py-6 backdrop-blur-sm"
          role="presentation"
          onClick={() => setSignOutOpen(false)}
        >
          <section
            aria-labelledby="signout-title"
            aria-modal="true"
            className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-neutral-100"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <Image className="logo-icon h-11 w-11" src={primaryLogo} alt="Bahas" />
              <div>
                <h2 id="signout-title" className="text-xl font-semibold tracking-[-0.02em] text-neutral-900">
                  Keluar dari Bahas?
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Sesi akun {user.email} akan ditutup dari browser ini.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                className="btn btn-secondary"
                disabled={busy === "signout"}
                onClick={() => setSignOutOpen(false)}
              >
                Batal
              </button>
              <button
                className="btn btn-danger"
                disabled={busy === "signout"}
                onClick={confirmSignOut}
              >
                {busy === "signout" ? "Keluar..." : "Keluar"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {selectedConversation ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/45 px-4 py-6 backdrop-blur-sm"
          role="presentation"
          onClick={() => setSelectedConversation(null)}
        >
          <section
            aria-labelledby="history-title"
            aria-modal="true"
            className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-neutral-100"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className={`chip ${selectedConversation.difficulty === "kalem" ? "chip-kalem" : "chip-emosian"}`}>
                    {selectedConversation.difficulty}
                  </span>
                  <span className="chip chip-relation">{formatDate(selectedConversation.created_at)}</span>
                </div>
                <h2 id="history-title" className="text-2xl font-semibold tracking-[-0.02em] text-neutral-900">
                  Detail Riwayat Latihan
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Chat, feedback, dan pesan siap kirim dari sesi yang sudah diakhiri.
                </p>
              </div>
              <button className="btn btn-secondary shrink-0" onClick={() => setSelectedConversation(null)}>
                Tutup
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
              <section>
                <h3 className="text-sm font-semibold text-neutral-800">Chat roleplay</h3>
                <div className="mt-3 flex max-h-96 flex-col gap-3 overflow-y-auto rounded-[24px] bg-neutral-50 p-4 shadow-[inset_0_0_0_1px_var(--color-neutral-100)]">
                  {selectedConversation.messages.length === 0 ? (
                    <p className="text-sm leading-6 text-neutral-500">Tidak ada chat tersimpan.</p>
                  ) : null}
                  {selectedConversation.messages.map((message, index) => (
                    <div
                      key={`history-${selectedConversation.id}-${index}`}
                      className={`bubble ${message.role === "user" ? "bubble-me" : "bubble-them"}`}
                    >
                      {message.content}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                {typeof selectedConversation.drama_score === "number" ? (
                  <DramaMeter score={selectedConversation.drama_score} />
                ) : (
                  <div className="rounded-2xl bg-neutral-50 p-5 shadow-[inset_0_0_0_1px_var(--color-neutral-100)]">
                    <p className="text-sm font-semibold text-neutral-500">Skor drama</p>
                    <p className="mt-2 font-mono text-3xl font-semibold text-neutral-900">-</p>
                  </div>
                )}
              </section>
            </div>

            {selectedConversation.feedback ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <ListBlock title="Pemicu" items={selectedConversation.feedback.triggers} />
                <ListBlock title="Peredam" items={selectedConversation.feedback.deescalators} />
                <div className="sm:col-span-2">
                  <ResultBlock title="Saran utama" text={selectedConversation.feedback.improvement} />
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-neutral-800">Pesan siap kirim</h3>
              {selectedConversation.summary_message ? (
                <p className="result-panel mt-3 text-sm leading-6">{selectedConversation.summary_message}</p>
              ) : (
                <p className="mt-3 rounded-2xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-500 shadow-[inset_0_0_0_1px_var(--color-neutral-100)]">
                  Belum ada pesan siap kirim untuk sesi ini.
                </p>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  )
}

function ResultBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-neutral-800">{title}</h2>
      <p className="result-panel mt-3 text-sm leading-6">{text}</p>
    </div>
  )
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-neutral-800">{title}</h2>
      <ul className="mt-2 space-y-2">
        {items.length === 0 ? <li className="text-sm text-neutral-500">Tidak ada.</li> : null}
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="rounded-2xl bg-white p-3 text-sm leading-6 text-neutral-600 shadow-[inset_0_0_0_1px_var(--color-neutral-100)]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold text-neutral-900">{value}</p>
    </div>
  )
}

function DramaMeter({ score }: { score: number }) {
  const clampedScore = Math.min(100, Math.max(0, score))
  const meterColor = clampedScore <= 33 ? "bg-success" : clampedScore <= 66 ? "bg-warning" : "bg-danger"
  const textColor = clampedScore <= 33 ? "text-success" : clampedScore <= 66 ? "text-warning" : "text-danger"
  const status = clampedScore <= 33 ? "Adem" : clampedScore <= 66 ? "Mulai tegang" : "Nyaris meledak"

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-neutral-500">Skor drama</p>
      <div className="mt-2 flex items-end gap-1">
        <p className={`font-mono text-5xl font-semibold leading-none ${textColor}`}>{clampedScore}</p>
        <p className="pb-1 font-mono text-sm text-neutral-400">/100</p>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-neutral-100">
        <div
          className={`h-full rounded-full ${meterColor} transition-[width] duration-300 ease-out`}
          style={{ width: `${clampedScore}%` }}
        />
      </div>
      <p className={`mt-3 text-sm font-semibold ${textColor}`}>{status}</p>
    </div>
  )
}

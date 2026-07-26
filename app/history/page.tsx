"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import primaryLogo from "../primary-logo.svg"

type Difficulty = "kalem" | "emosian"

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

type ConversationRow = {
  id: string
  difficulty: Difficulty
  drama_score: number | null
  feedback: Feedback | null
  messages: ChatMessage[]
  summary_message: string | null
  created_at: string
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export default function HistoryPage() {
  const supabase = useMemo(() => createClient(), [])
  const [rows, setRows] = useState<ConversationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ConversationRow | null>(null)

  useEffect(() => {
    supabase
      .from("conversations")
      .select("id,difficulty,drama_score,feedback,messages,summary_message,created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRows((data ?? []) as ConversationRow[])
        setLoading(false)
      })
  }, [supabase])

  return (
    <main className="app-shell min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image className="logo-icon" src={primaryLogo} alt="Bahas" priority />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-700">Bahas</p>
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-neutral-900">Riwayat Latihan</h1>
            </div>
          </div>
          <Link className="btn btn-secondary" href="/">
            Kembali
          </Link>
        </header>

        <section className="card">
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Sesi" value={rows.length.toString()} />
            <Metric
              label="Skor terbaru"
              value={rows.find((row) => typeof row.drama_score === "number")?.drama_score?.toString() ?? "-"}
            />
            <Metric
              label="Pesan"
              value={rows.filter((row) => Boolean(row.summary_message)).length.toString()}
            />
          </div>
        </section>

        {loading ? (
          <section className="card">
            <p className="text-sm text-neutral-500">Memuat riwayat...</p>
          </section>
        ) : rows.length === 0 ? (
          <section className="card">
            <p className="text-sm leading-6 text-neutral-500">
              Belum ada sesi selesai. Akhiri satu roleplay dari halaman utama untuk menyimpan chat dan feedback.
            </p>
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            {rows.map((row) => (
              <button
                key={row.id}
                className="card text-left transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-200"
                onClick={() => setSelected(row)}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`chip ${row.difficulty === "kalem" ? "chip-kalem" : "chip-emosian"}`}>
                    {row.difficulty}
                  </span>
                  <p className="font-mono text-sm font-semibold text-primary-700">{row.drama_score ?? "-"}/100</p>
                </div>
                <p className="mt-3 text-xs font-medium text-neutral-400">{formatDate(row.created_at)}</p>
                {row.feedback?.improvement ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-500">{row.feedback.improvement}</p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="chip chip-relation">{row.messages.length} pesan</span>
                  {row.summary_message ? <span className="chip chip-kalem">ada pesan siap kirim</span> : null}
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">Buka detail</p>
              </button>
            ))}
          </section>
        )}
      </div>

      {selected ? (
        <HistoryDetail conversation={selected} onClose={() => setSelected(null)} />
      ) : null}
    </main>
  )
}

function HistoryDetail({
  conversation,
  onClose,
}: {
  conversation: ConversationRow
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/45 px-4 py-6 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
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
              <span className={`chip ${conversation.difficulty === "kalem" ? "chip-kalem" : "chip-emosian"}`}>
                {conversation.difficulty}
              </span>
              <span className="chip chip-relation">{formatDate(conversation.created_at)}</span>
            </div>
            <h2 id="history-title" className="text-2xl font-semibold tracking-[-0.02em] text-neutral-900">
              Detail Riwayat Latihan
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Chat, feedback, dan pesan siap kirim dari sesi yang sudah diakhiri.
            </p>
          </div>
          <button className="btn btn-secondary shrink-0" onClick={onClose}>
            Tutup
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
          <section>
            <h3 className="text-sm font-semibold text-neutral-800">Chat roleplay</h3>
            <div className="mt-3 flex max-h-96 flex-col gap-3 overflow-y-auto rounded-[24px] bg-neutral-50 p-4 shadow-[inset_0_0_0_1px_var(--color-neutral-100)]">
              {conversation.messages.length === 0 ? (
                <p className="text-sm leading-6 text-neutral-500">Tidak ada chat tersimpan.</p>
              ) : null}
              {conversation.messages.map((message, index) => (
                <div
                  key={`history-${conversation.id}-${index}`}
                  className={`bubble ${message.role === "user" ? "bubble-me" : "bubble-them"}`}
                >
                  {message.content}
                </div>
              ))}
            </div>
          </section>

          <section>
            {typeof conversation.drama_score === "number" ? (
              <DramaMeter score={conversation.drama_score} />
            ) : (
              <div className="rounded-2xl bg-neutral-50 p-5 shadow-[inset_0_0_0_1px_var(--color-neutral-100)]">
                <p className="text-sm font-semibold text-neutral-500">Skor drama</p>
                <p className="mt-2 font-mono text-3xl font-semibold text-neutral-900">-</p>
              </div>
            )}
          </section>
        </div>

        {conversation.feedback ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <ListBlock title="Pemicu" items={conversation.feedback.triggers} />
            <ListBlock title="Peredam" items={conversation.feedback.deescalators} />
            <div className="sm:col-span-2">
              <ResultBlock title="Saran utama" text={conversation.feedback.improvement} />
            </div>
          </div>
        ) : null}

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-neutral-800">Pesan siap kirim</h3>
          {conversation.summary_message ? (
            <p className="result-panel mt-3 text-sm leading-6">{conversation.summary_message}</p>
          ) : (
            <p className="mt-3 rounded-2xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-500 shadow-[inset_0_0_0_1px_var(--color-neutral-100)]">
              Belum ada pesan siap kirim untuk sesi ini.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

function ResultBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
      <p className="result-panel mt-3 text-sm leading-6">{text}</p>
    </div>
  )
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
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
      <p className="mt-1 font-mono text-3xl font-semibold text-neutral-900">{value}</p>
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

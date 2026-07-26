"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import primaryLogo from "../primary-logo.svg"

type ProgressRow = {
  id: string
  created_at: string
  difficulty: "kalem" | "emosian"
  drama_score: number | null
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value))
}

function buildSparkline(rows: ProgressRow[]) {
  const scores = rows
    .map((row) => row.drama_score)
    .filter((score): score is number => typeof score === "number")

  if (scores.length === 0) return ""
  if (scores.length === 1) return `M 0 ${100 - scores[0]} L 100 ${100 - scores[0]}`

  return scores
    .map((score, index) => {
      const x = (index / (scores.length - 1)) * 100
      const y = 100 - score
      return `${index === 0 ? "M" : "L"} ${x} ${y}`
    })
    .join(" ")
}

export default function ProgressPage() {
  const supabase = useMemo(() => createClient(), [])
  const [rows, setRows] = useState<ProgressRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from("conversations")
      .select("id,created_at,difficulty,drama_score")
      .not("drama_score", "is", null)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setRows((data ?? []) as ProgressRow[])
        setLoading(false)
      })
  }, [supabase])

  const scores = rows
    .map((row) => row.drama_score)
    .filter((score): score is number => typeof score === "number")
  const latest = scores.at(-1) ?? null
  const average = scores.length ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length) : null
  const best = scores.length ? Math.min(...scores) : null
  const path = buildSparkline(rows)

  return (
    <main className="app-shell min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image className="logo-icon" src={primaryLogo} alt="Bahas" priority />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-700">Bahas</p>
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-neutral-900">Dashboard Kemajuan</h1>
            </div>
          </div>
          <Link className="btn btn-secondary" href="/">
            Kembali
          </Link>
        </header>

        <section className="card">
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Sesi selesai" value={scores.length.toString()} />
            <Metric label="Skor terbaru" value={latest === null ? "-" : latest.toString()} />
            <Metric label="Rata-rata" value={average === null ? "-" : average.toString()} />
          </div>
        </section>

        <section className="card">
          <div className="flex flex-col gap-2">
            <span className="chip chip-relation w-fit">Tren skor drama</span>
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-neutral-900">Makin rendah, makin adem</h2>
            <p className="text-sm leading-6 text-neutral-500">
              Grafik ini membaca skor dari sesi roleplay yang sudah tersimpan di tabel conversations milik user.
            </p>
          </div>

          <div className="mt-6 rounded-[24px] bg-neutral-50 p-5 shadow-[inset_0_0_0_1px_var(--color-neutral-100)]">
            {loading ? (
              <p className="text-sm text-neutral-500">Memuat data...</p>
            ) : scores.length === 0 ? (
              <p className="text-sm leading-6 text-neutral-500">
                Belum ada sesi dengan skor drama. Selesaikan satu roleplay dulu dari halaman utama.
              </p>
            ) : (
              <svg viewBox="0 0 100 100" className="h-64 w-full overflow-visible">
                <line x1="0" x2="100" y1="20" y2="20" stroke="#E2E5EC" strokeWidth="1" />
                <line x1="0" x2="100" y1="50" y2="50" stroke="#E2E5EC" strokeWidth="1" />
                <line x1="0" x2="100" y1="80" y2="80" stroke="#E2E5EC" strokeWidth="1" />
                <path d={path} fill="none" stroke="#1800AD" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                {scores.map((score, index) => {
                  const x = scores.length === 1 ? 50 : (index / (scores.length - 1)) * 100
                  const y = 100 - score
                  return <circle key={`${score}-${index}`} cx={x} cy={y} fill="#1800AD" r="2.8" />
                })}
              </svg>
            )}
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-neutral-900">Riwayat skor</h2>
          <div className="mt-4 space-y-3">
            {rows.map((row) => (
              <article key={row.id} className="rounded-2xl bg-neutral-50 p-4 shadow-[inset_0_0_0_1px_var(--color-neutral-100)]">
                <div className="flex items-center justify-between gap-3">
                  <span className={`chip ${row.difficulty === "kalem" ? "chip-kalem" : "chip-emosian"}`}>{row.difficulty}</span>
                  <p className="font-mono text-sm font-semibold text-primary-700">{row.drama_score}/100</p>
                </div>
                <p className="mt-2 text-xs font-medium text-neutral-400">{formatDate(row.created_at)}</p>
              </article>
            ))}
            {best !== null ? <p className="text-sm font-semibold text-success">Skor terbaik sejauh ini: {best}/100</p> : null}
          </div>
        </section>
      </div>
    </main>
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

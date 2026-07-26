"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import primaryLogo from "../primary-logo.svg"

type SavedLine = {
  id: string
  text: string
  source: string | null
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

export default function SavedLinesPage() {
  const supabase = useMemo(() => createClient(), [])
  const [lines, setLines] = useState<SavedLine[]>([])
  const [loading, setLoading] = useState(true)
  const [copyStatus, setCopyStatus] = useState("")

  useEffect(() => {
    supabase
      .from("saved_lines")
      .select("id,text,source,created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setLines((data ?? []) as SavedLine[])
        setLoading(false)
      })
  }, [supabase])

  async function copyLine(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopyStatus("Kalimat disalin.")
    } catch {
      setCopyStatus("Gagal menyalin otomatis. Salin manual dari teks kartu.")
    }
  }

  return (
    <main className="app-shell min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image className="logo-icon" src={primaryLogo} alt="Bahas" priority />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-700">Bahas</p>
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-neutral-900">Kalimat Tersimpan</h1>
            </div>
          </div>
          <Link className="btn btn-secondary" href="/">
            Kembali
          </Link>
        </header>

        <section className="card">
          <div className="flex flex-col gap-2">
            <span className="chip chip-relation w-fit">{lines.length} kalimat</span>
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-neutral-900">Kalimat andalan pribadi</h2>
            <p className="text-sm leading-6 text-neutral-500">
              Semua kalimat yang pernah disimpan dari naskah pembuka, rewrite, pesan siap kirim, atau input manual.
            </p>
          </div>
          {copyStatus ? <p className="status-callout mt-5 text-sm">{copyStatus}</p> : null}
        </section>

        {loading ? (
          <section className="card">
            <p className="text-sm text-neutral-500">Memuat kalimat...</p>
          </section>
        ) : lines.length === 0 ? (
          <section className="card">
            <p className="text-sm leading-6 text-neutral-500">
              Belum ada kalimat tersimpan. Simpan naskah pembuka, hasil rewrite, atau pesan siap kirim dari halaman utama.
            </p>
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            {lines.map((line) => (
              <article key={line.id} className="card">
                <p className="text-sm leading-7 text-neutral-700">{line.text}</p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
                      {line.source ?? "manual"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-neutral-400">{formatDate(line.created_at)}</p>
                  </div>
                  <button className="btn btn-secondary" onClick={() => copyLine(line.text)}>
                    Salin
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}

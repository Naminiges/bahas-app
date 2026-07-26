"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import primaryLogo from "../primary-logo.svg"

type DemoMessage = {
  role: "user" | "assistant"
  content: string
}

const demoScenario = {
  relation: "Saudara (adik)",
  situation: "Adik sering pinjam uang tapi jarang balikin.",
  openingScript:
    "Dik, aku mau ngobrol soal pinjaman kemarin, boleh ya? Aku tidak marah, cuma pengen kita enak sama-sama.",
  predictedReaction: "Ngeles: 'Yaelah cuma segitu doang.'",
  responseAdvice: "Akui nominalnya mungkin kecil, lalu tegaskan bahwa yang dibahas adalah kebiasaan dan rasa percaya.",
}

const demoReplies = [
  "Yaelah, Kak, cuma segitu doang. Aku juga lagi banyak kebutuhan.",
  "Kok sekarang jadi itung-itungan gitu? Bukannya selama ini kita saling bantu?",
  "Ya sudah, aku coba balikin bertahap. Tapi jangan bikin aku merasa disudutkan juga.",
]

export default function DemoPage() {
  const [chat, setChat] = useState<DemoMessage[]>([])
  const [input, setInput] = useState(demoScenario.openingScript)

  function sendDemoMessage() {
    if (!input.trim()) return
    const turn = chat.filter((message) => message.role === "user").length
    const reply = demoReplies[Math.min(turn, demoReplies.length - 1)]
    setChat([
      ...chat,
      { role: "user", content: input.trim() },
      { role: "assistant", content: reply },
    ])
    setInput("")
  }

  return (
    <main className="app-shell min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image className="logo-icon" src={primaryLogo} alt="Bahas" priority />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-700">Mode Demo</p>
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-neutral-900">Coba Bahas tanpa login</h1>
            </div>
          </div>
          <Link className="btn btn-primary" href="/">
            Daftar untuk Simpan Progres
          </Link>
        </header>

        <section className="status-callout text-sm leading-6">
          Mode demo tidak menulis ke database. Semua chat di halaman ini hanya simulasi sementara untuk penjurian.
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="card">
            <div className="mb-6 flex flex-col gap-2">
              <span className="chip chip-relation w-fit">{demoScenario.relation}</span>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-neutral-900">Skenario contoh</h2>
              <p className="text-sm leading-6 text-neutral-500">{demoScenario.situation}</p>
            </div>

            <div className="space-y-4">
              <div className="result-panel text-sm leading-6">
                <p className="font-semibold text-neutral-900">Naskah pembuka</p>
                <p className="mt-2">{demoScenario.openingScript}</p>
              </div>
              <article className="rounded-2xl bg-neutral-50 p-4 shadow-[inset_0_0_0_1px_var(--color-neutral-100)]">
                <p className="text-sm font-semibold text-neutral-900">{demoScenario.predictedReaction}</p>
                <p className="mt-1 text-sm leading-6 text-neutral-500">{demoScenario.responseAdvice}</p>
              </article>
            </div>
          </section>

          <aside className="card">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-neutral-900">Feedback demo</h2>
            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-neutral-500">Skor drama</p>
              <p className="mt-2 font-mono text-5xl font-semibold leading-none text-warning">48</p>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full w-[48%] rounded-full bg-warning" />
              </div>
              <p className="mt-3 text-sm font-semibold text-warning">Mulai tegang</p>
            </div>
            <p className="mt-4 text-sm leading-6 text-neutral-500">
              Saran: mulai dengan validasi kondisi adik, lalu buat batas pengembalian yang jelas.
            </p>
          </aside>
        </div>

        <section className="card">
          <div className="flex flex-col gap-2">
            <span className="chip chip-emosian w-fit">Roleplay statis</span>
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-neutral-900">Latihan singkat</h2>
          </div>

          <div className="mt-6 flex min-h-72 flex-col gap-4 rounded-[24px] bg-neutral-50 p-4 shadow-[inset_0_0_0_1px_var(--color-neutral-100)] sm:p-5">
            {chat.length === 0 ? (
              <p className="m-auto max-w-sm text-center text-sm leading-6 text-neutral-500">
                Kirim naskah pembuka untuk melihat simulasi respons adik.
              </p>
            ) : null}
            {chat.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`bubble ${message.role === "user" ? "bubble-me" : "bubble-them"}`}>
                {message.content}
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input className="input" value={input} onChange={(event) => setInput(event.target.value)} />
            <button className="btn btn-primary" disabled={!input.trim()} onClick={sendDemoMessage}>
              Kirim
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

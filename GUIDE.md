# Guide — Bahas (Setup & Kode Lengkap)

> Panduan langkah-demi-langkah membangun **Bahas** dari nol sampai deploy publik, mengikuti *Vibe Coding Loop*: FRAME → SCAFFOLD → INJECT → VERIFY → HARDEN → SHIP. Kualitas setara garapan 24 jam, dieksekusi singkat dengan alur AI-assisted. Stack gratis: **Next.js 15 + Supabase + Gemini + Vercel**.
> 

## 0. Prasyarat

- Akun **GitHub**, **Vercel**, **Supabase** (semua free tier).
- **Node.js 20+** terpasang.
- **API key Gemini** dari Google AI Studio (free tier).
- Prinsip: *tidak ada rahasia/nilai yang di-hardcode* — semua lewat `.env` dan database nyata.

---

## 1. FRAME — kunci PRD sebagai jangkar

PRD kita sudah jadi *single source of truth*. Setiap kali AI coding tool mulai "ngaco", tempel ulang bagian PRD yang relevan (data model, endpoint, nama field). AI itu *stateless* — PRD-lah memorinya.

---

## 2. SCAFFOLD — rangka hidup + DB nyambung

### 2.1 Buat project

```bash
npx create-next-app@latest bahas --typescript --tailwind --app --eslint
cd bahas
```

### 2.2 Install dependency

```bash
npm install ai @ai-sdk/google @supabase/supabase-js @supabase/ssr zod
npm install -D vitest
```

### 2.3 Environment variables — `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

> ⚠️ `.env.local` sudah otomatis masuk `.gitignore`. **Jangan pernah** commit key. Di Vercel, set tiga variabel ini di **Settings → Environment Variables**.
> 

---

## 3. Database + RLS (Supabase SQL Editor)

Jalankan di Supabase → SQL Editor. Tiga tabel, semua terisolasi per user lewat RLS.

```sql
-- 1) SKENARIO: situasi + naskah pembuka hasil AI
create table public.scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  relation text not null,               -- 'orang tua' | 'pasangan' | 'saudara' | 'keluarga jauh'
  topic text,
  situation text not null,
  fear text,
  cultural_note text,
  opening_script text,
  predicted_reactions jsonb,
  created_at timestamptz not null default now()
);

-- 2) PERCAKAPAN: sesi roleplay + feedback
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  scenario_id uuid references public.scenarios(id) on delete cascade,
  difficulty text not null default 'kalem',
  messages jsonb not null default '[]'::jsonb,
  drama_score int,
  feedback jsonb,
  created_at timestamptz not null default now()
);

-- 3) KALIMAT ANDALAN tersimpan
create table public.saved_lines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  text text not null,
  source text,
  created_at timestamptz not null default now()
);

-- Nyalakan RLS (tanpa ini DB praktis publik!)
alter table public.scenarios enable row level security;
alter table public.conversations enable row level security;
alter table public.saved_lines enable row level security;

-- Policy: user hanya bisa akses barisnya sendiri
create policy "own scenarios" on public.scenarios
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own conversations" on public.conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own saved_lines" on public.saved_lines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

> ✅ VERIFY: buka Table Editor — pastikan 3 tabel muncul & RLS aktif (ikon gembok).
> 

---

## 4. Supabase client (SSR)

### `lib/supabase/client.ts` (browser)

```tsx
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

### `lib/supabase/server.ts` (server / API routes)

```tsx
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // dipanggil dari Server Component — aman diabaikan
          }
        },
      },
    },
  )
}
```

### `middleware.ts` (refresh sesi)

```tsx
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )
  await supabase.auth.getUser()
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
```

---

## 5. INJECT — LLM sebagai fungsi inti (`lib/ai.ts`)

Jantung produk. AI menjalankan **5 peran**: Classify, Generate, Act (roleplay), Score, Transform.

```tsx
import { google } from "@ai-sdk/google"
import { generateObject, generateText } from "ai"
import { z } from "zod"

// Model 3.x Flash: kualitas mendekati Pro, kuota free tier lebih lega dari 2.0.
// Kalau masih kena limit token, ganti ke "gemini-3.5-flash-lite" (throughput lebih tinggi, lebih murah).
const model = google("gemini-3.5-flash")

// (1) CLASSIFY + (2) GENERATE
export async function analyzeScenario(input: {
  situation: string
  relation: string
  fear?: string
}) {
  const { object } = await generateObject({
    model,
    schema: z.object({
      topic: z.string(),
      cultural_note: z.string(),
      opening_script: z.string(),
      predicted_reactions: z
        .array(z.object({ reaksi: z.string(), saran_respons: z.string() }))
        .max(3),
    }),
    system:
      "Kamu pelatih komunikasi keluarga Indonesia. Bantu user membahas uang tanpa drama. " +
      "Sadar konteks budaya (uang panai, warisan, gengsi, 'rezeki diganti'). " +
      "Naskah singkat, hangat, tidak menuduh, pakai 'aku' bukan 'kamu selalu'.",
    prompt: `Relasi: ${input.relation}\nSituasi: ${input.situation}\nKetakutan user: ${input.fear ?? "-"}`,
  })
  return object
}

// (3) ACT: AI memerankan lawan bicara
export async function roleplayReply(input: {
  relation: string
  difficulty: "kalem" | "emosian"
  situation: string
  history: { role: "user" | "assistant"; content: string }[]
  userMessage: string
}) {
  const { text } = await generateText({
    model,
    system:
      `Kamu MEMERANKAN ${input.relation} dari user dalam latihan obrolan uang. ` +
      `Situasi: ${input.situation}. ` +
      `Sifat: ${input.difficulty === "emosian" ? "mudah tersinggung, defensif" : "tenang tapi punya ego"}. ` +
      "Balas natural sebagai orang itu (1-3 kalimat, bahasa sehari-hari). " +
      "JANGAN keluar karakter. JANGAN memberi nasihat sebagai AI.",
    messages: [...input.history, { role: "user", content: input.userMessage }],
  })
  return text
}

// (4) SCORE
export async function scoreConversation(
  messages: { role: string; content: string }[],
) {
  const { object } = await generateObject({
    model,
    schema: z.object({
      drama_score: z.number().min(0).max(100),
      triggers: z.array(z.string()).max(3),
      deescalators: z.array(z.string()).max(3),
      improvement: z.string(),
    }),
    system:
      "Nilai percakapan uang keluarga. drama_score: 0=sangat adem, 100=meledak. " +
      "triggers=kalimat USER yang memicu drama. deescalators=kalimat USER yang menenangkan. " +
      "improvement=satu saran utama, konkret.",
    prompt: JSON.stringify(messages),
  })
  return object
}

// (5) TRANSFORM
export async function rewriteTone(input: { text: string; relation: string }) {
  const { object } = await generateObject({
    model,
    schema: z.object({ rewritten: z.string(), note: z.string() }),
    system:
      "Tulis ulang pesan agar sopan, tidak menuduh, minim drama, konteks keluarga Indonesia. " +
      "note=jelaskan singkat apa yang diubah & kenapa.",
    prompt: `Ke: ${input.relation}\nPesan asli: ${input.text}`,
  })
  return object
}

// (SAFETY) deteksi kata risiko tanpa AI (murah & pasti)
const RISK = ["bunuh diri", "mengakhiri hidup", "kdrt", "dipukul", "kekerasan", "mengancam"]
export function checkRisk(text: string) {
  const hit = RISK.some((k) => text.toLowerCase().includes(k))
  return {
    risky: hit,
    resource: hit
      ? "Kalau ada ancaman/kekerasan, hubungi SAPA 129 atau 119 ext 8. Bahas bukan pengganti bantuan profesional."
      : null,
  }
}
```

---

## 6. API routes (auth-gated)

Semua route menolak user yang belum login (401). Contoh `app/api/scenario/route.ts`:

```tsx
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
```

Buat pola yang sama untuk:

- `app/api/roleplay/route.ts` → panggil `roleplayReply(...)`, kembalikan balasan karakter.
- `app/api/feedback/route.ts` → panggil `scoreConversation(...)`, simpan `drama_score` + `feedback` ke `conversations`.
- `app/api/rewrite/route.ts` → panggil `rewriteTone(...)`.

> Semua wajib cek `user` dulu (401) & validasi input (400). Ini poin **kompetensi role & aman** di rubrik.
> 

---

## 7. Frontend — `app/page.tsx` (auth gate + UI)

```tsx
"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function Home() {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user ?? null),
    )
    return () => sub.subscription.unsubscribe()
  }, [])

  async function signIn() {
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    alert("Cek email untuk link login.")
  }

  if (!user) {
    return (
      <main className="max-w-md mx-auto p-8 space-y-4">
        <h1 className="text-2xl font-bold">Bahas</h1>
        <p className="text-gray-600">Latihan ngobrol uang, sebelum ngobrol beneran.</p>
        <input className="border p-2 w-full rounded" placeholder="email"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="bg-black text-white px-4 py-2 rounded" onClick={signIn}>
          Kirim link login
        </button>
      </main>
    )
  }

  return <BahasApp />
}

function BahasApp() {
  // 3 tab: Siapkan (form -> naskah), Latihan (roleplay), Terjemah nada
  // Panggil /api/scenario, /api/roleplay, /api/feedback, /api/rewrite
  // Tampilkan opening_script, predicted_reactions, drama_score, feedback.
  return <main className="max-w-2xl mx-auto p-8">/* UI di sini */</main>
}
```

> Minta AI coding tool meng-generate isi `BahasApp` sesuai PRD (3 tab). Kamu me-review keputusan, bukan mengetik tiap baris.
> 

---

## 8. VERIFY — TDD (test gagal dulu)

`lib/ai.test.ts` (vitest):

```tsx
import { describe, it, expect } from "vitest"
import { checkRisk } from "./ai"

describe("checkRisk", () => {
  it("menandai kata risiko", () => {
    expect(checkRisk("dia sering melakukan kekerasan").risky).toBe(true)
  })
  it("aman untuk situasi biasa", () => {
    expect(checkRisk("adik pinjam uang terus").risky).toBe(false)
  })
})
```

Jalankan:

```bash
npx vitest run
```

> Prinsip: *"jangan percaya buta"*. Setelah app jalan, buka Table Editor Supabase — pastikan baris `scenarios` beneran masuk. Tes sambungan Frontend ↔ API ↔ DB sekali penuh.
> 

---

## 9. HARDEN — aman-in sebelum ship

- [ ]  Secret hanya di `.env` / Vercel env, tidak di client, tidak di-commit.
- [ ]  RLS menyala di 3 tabel.
- [ ]  Validasi input tiap endpoint (400 jika kurang).
- [ ]  Rate limit sederhana per user (mis. hitung request/menit) biar kuota LLM tidak boncos.
- [ ]  Sadar prompt injection: perlakukan input user sebagai data, bukan instruksi — jangan gabungkan mentah ke system prompt roleplay.
- [ ]  `checkRisk` aktif → tampilkan rujukan bantuan bila terpicu.

---

## 10. SHIP — deploy publik

1. `git init` → commit kecil bermakna (`feat: scenario endpoint`, dst) → push ke GitHub.
2. Import repo ke **Vercel** → set 3 env var → Deploy.
3. Supabase → Authentication → URL Configuration → tambah domain Vercel ke **Redirect URLs** & **Site URL**.
4. Buat `PRD.md` di root repo (ringkas dari PRD ini) — wajib output Hacker.
5. Deploy dari awal & sering; tiap gagal deploy, umpankan log ke AI (AI Debugging Loop: Capture → Feed → Root → Verify).

---

## 11. Troubleshooting (AI Debugging Loop)

| Gejala | Akar biasanya | Fix |
| --- | --- | --- |
| Data tidak masuk DB | RLS aktif tapi user null / policy salah | Pastikan login & `user_id` default `auth.uid()` |
| 401 terus | Cookie sesi tidak ke-refresh | Cek `middleware.ts` & matcher |
| `generateObject` error parse | Output model tidak sesuai schema | Perketat `system`, kecilkan schema |
| Jalan di lokal, gagal di Vercel | Env var lupa di-set di Vercel | Set 3 env var di Settings |
| Magic link redirect gagal | Domain belum di allowlist | Tambah domain di Supabase Auth URL Config |

---

## 12. Definition of Done (output Hacker)

- [ ]  MVP full-stack jalan (FE + API + Supabase + Gemini).
- [ ]  Deploy di URL publik yang bisa dibuka juri.
- [ ]  Pipeline penuh: input → AI → DB → tampil.
- [ ]  Riwayat commit GitHub yang rapi.
- [ ]  Tidak ada nilai/rahasia di-hardcode.
- [ ]  `PRD.md` ada di repo.

## 13. Peningkatan Fase 2 (Aditif — Jangan Ubah yang Lama)

> **Penting:** MVP (§0–§12) sudah jadi & jalan. Semua langkah di bawah **hanya menambah** file/kolom/endpoint/halaman baru. **Jangan mengubah** `lib/ai.ts`, route, atau komponen yang sudah ada — cukup **tambahkan** yang baru. Selaras dengan PRD §22. Gaya visual ikut `design.md`.
> 

### 13.1 Rangkuman Siap Kirim

**a. SQL (aditif) — jalankan di Supabase SQL Editor:**

```sql
alter table public.conversations
  add column if not exists summary_message text;
```

**b. Fungsi BARU di `lib/ai.ts`** (jangan sentuh fungsi lain):

```tsx
// TAMBAHAN Fase 2 — jangan ubah fungsi yang sudah ada
export async function draftRealMessage(input: {
  relation: string
  situation: string
  messages: { role: string; content: string }[]
  feedback?: unknown
}) {
  const { object } = await generateObject({
    model,
    schema: z.object({ message: z.string(), catatan: z.string() }),
    system:
      "Rangkum jadi SATU pesan singkat (2-4 kalimat) yang benar-benar bisa user KIRIM ke " +
      "lawan bicaranya. Sopan, tidak menuduh, pakai 'aku', konteks keluarga Indonesia. " +
      "catatan=alasan singkat pilihan nada.",
    prompt: JSON.stringify({
      relation: input.relation,
      situation: input.situation,
      messages: input.messages,
      feedback: input.feedback,
    }),
  })
  return object
}
```

**c. Endpoint baru `app/api/summary/route.ts`** (pola sama, auth-gated):

```tsx
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { draftRealMessage } from "@/lib/ai"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { conversationId, relation, situation, messages, feedback } = await req.json()
  const draft = await draftRealMessage({ relation, situation, messages, feedback })

  if (conversationId) {
    await supabase.from("conversations")
      .update({ summary_message: draft.message })
      .eq("id", conversationId)
  }
  return NextResponse.json(draft)
}
```

**d. UI:** tombol "Buatkan pesan siap kirim" di panel feedback → tampilkan hasil + tombol **Salin** (`navigator.clipboard`) & **Simpan ke kalimat andalan** (pakai flow `saved_lines` yang sudah ada).

### 13.2 Mode Demo Tanpa Login

Halaman publik yang **tidak menulis ke DB**. Buat `app/demo/page.tsx`:

```tsx
"use client"
import { useState } from "react"

const DEMO = {
  relation: "Saudara (adik)",
  situation: "Adik sering pinjam uang tapi jarang balikin.",
  opening_script:
    "Dik, aku mau ngobrol soal pinjaman kemarin, boleh ya? Aku nggak marah, cuma pengen kita enak sama-sama.",
  predicted_reactions: [
    { reaksi: "Ngeles: 'Yaelah cuma segitu doang'", saran_respons: "Akui nominalnya kecil, tegaskan soal kebiasaan bukan angka." },
  ],
}

export default function DemoPage() {
  const [chat, setChat] = useState<{ role: string; content: string }[]>([])
  // Banner: "Mode demo — progres tidak disimpan. Daftar untuk menyimpan."
  // Roleplay demo: panggil endpoint publik demo ATAU balasan skrip statis (tanpa DB).
  return <main className="max-w-2xl mx-auto p-8">/* UI demo pakai class design.md */</main>
}
```

> Opsi backend demo: bikin route publik `POST /api/demo/roleplay` yang memanggil `roleplayReply` **tanpa** cek user & **tanpa** insert DB (khusus demo, tetap kena rate limit). Atau paling hemat kuota: balasan skrip statis. Pilih salah satu — **jangan modif endpoint asli**.
> 

### 13.3 Lawan Bicara Adaptif + Curveball

Fungsi BARU di `lib/ai.ts` (jangan ubah `roleplayReply`):

```tsx
// TAMBAHAN Fase 2
export async function roleplayReplyAdaptive(input: {
  relation: string
  situation: string
  history: { role: "user" | "assistant"; content: string }[]
  userMessage: string
  dramaSoFar: number   // 0-100, skor drama berjalan
  turn: number         // giliran ke-berapa
}) {
  const mood =
    input.dramaSoFar > 60 ? "makin defensif & mudah tersinggung"
    : input.dramaSoFar < 30 ? "mulai melunak & terbuka"
    : "waspada tapi mau mendengar"
  const curveball =
    input.turn === 3
      ? "Sekali ini, lempar keberatan tak terduga khas keluarga (mis. mengungkit jasa/masa lalu) untuk menguji user."
      : ""
  const { text } = await generateText({
    model,
    system:
      `Kamu MEMERANKAN ${input.relation} dari user dalam latihan obrolan uang. Situasi: ${input.situation}. ` +
      `Kondisi emosimu sekarang: ${mood}. ${curveball} ` +
      "Balas natural 1-3 kalimat, tetap in-character, jangan jadi AI.",
    messages: [...input.history, { role: "user", content: input.userMessage }],
  })
  return text
}
```

> `dramaSoFar` bisa diisi estimasi ringan di client atau dari `scoreConversation` berkala. Alihkan pemanggilan roleplay di UI ke fungsi ini **hanya jika** ingin mode adaptif; endpoint & fungsi lama tetap ada.
> 

### 13.4 Dashboard Kemajuan

Buat `app/progress/page.tsx` — query `conversations` yang sudah ada, render grafik sederhana (SVG, tanpa dependency baru):

```tsx
"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function Progress() {
  const supabase = createClient()
  const [rows, setRows] = useState<{ created_at: string; drama_score: number }[]>([])
  useEffect(() => {
    supabase
      .from("conversations")
      .select("created_at, drama_score")
      .not("drama_score", "is", null)
      .order("created_at", { ascending: true })
      .then(({ data }) => setRows(data ?? []))
  }, [])
  // Render: sparkline SVG dari drama_score + skor rata-rata + jumlah sesi.
  return <main className="max-w-2xl mx-auto p-8 card">/* grafik pakai class design.md */</main>
}
```

> RLS memastikan tiap user hanya melihat datanya sendiri — tak perlu filter `user_id` manual. Tambahkan link "Kemajuan" di header aplikasi.
> 

### 13.5 Definition of Done (Fase 2)

- [ ]  Kolom `summary_message` ditambah via `IF NOT EXISTS` (data lama aman).
- [ ]  Fungsi & endpoint baru tidak mengubah yang lama; MVP tetap jalan.
- [ ]  Mode demo tidak menulis ke DB.
- [ ]  Rate limit tetap aktif untuk endpoint AI baru.
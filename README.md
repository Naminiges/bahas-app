# Bahas

**Bahas** adalah aplikasi AI untuk melatih percakapan keuangan yang sensitif dengan keluarga atau pasangan sebelum percakapan itu terjadi di dunia nyata.

Tagline: **Latihan ngobrol uang, sebelum ngobrol beneran.**

Banyak masalah finansial keluarga tidak berhenti di angka, tetapi di cara membicarakannya: utang keluarga, pasangan belanja tanpa kabar, warisan, adik sering pinjam uang, budaya gengsi, atau mindset "rezeki diganti". Bahas membantu pengguna menyiapkan naskah pembuka, berlatih roleplay dengan AI, mendapat skor drama, membuat pesan siap kirim, menyimpan kalimat andalan, dan memantau progres latihan.

## Fitur Utama

- Login privat dengan Supabase magic link.
- Mode demo publik di `/demo` tanpa login dan tanpa menulis ke database.
- Form skenario: relasi, situasi, dan ketakutan pengguna.
- AI membuat topik, catatan budaya, naskah pembuka, dan prediksi reaksi.
- Roleplay chat dengan AI yang memerankan lawan bicara.
- Pilihan tingkat kesulitan: `kalem` atau `emosian`.
- Mode roleplay adaptif yang menyesuaikan respons AI berdasarkan perkiraan eskalasi.
- Feedback sesi: skor drama 0-100, pemicu, peredam, dan satu saran utama.
- Pesan siap kirim setelah feedback, lengkap dengan tombol salin dan simpan.
- Penerjemah nada untuk mengubah pesan emosional menjadi versi sopan.
- Simpan kalimat andalan per user.
- Halaman `/saved-lines` untuk melihat semua kalimat tersimpan.
- Halaman `/history` untuk melihat ulang chat roleplay, feedback, skor, dan pesan siap kirim dari sesi lama.
- Dashboard `/progress` untuk melihat tren skor drama.
- Dropdown akun berisi navigasi ke Kemajuan, Kalimat tersimpan, Riwayat latihan, dan Keluar.
- Modal konfirmasi logout yang menggantikan alert browser.
- Deteksi kata risiko dan rujukan bantuan.
- Rate limit sederhana untuk endpoint AI.

## Kenapa Bukan ChatGPT Biasa?

Bahas bukan kotak chat kosong. Nilainya ada pada alur produk yang terpandu:

| Aspek | AI generik | Bahas |
| --- | --- | --- |
| Titik mulai | User harus tahu prompt sendiri | Form situasi, relasi, dan ketakutan |
| Latihan | Sulit konsisten memerankan lawan bicara | Roleplay in-character dengan kesulitan dan mode adaptif |
| Umpan balik | Tidak ada ukuran progres | Skor drama, feedback konkret, dan dashboard kemajuan |
| Aksi nyata | User harus merangkum sendiri | Pesan siap kirim setelah latihan |
| Retensi data | Riwayat tidak terstruktur | Riwayat sesi, kalimat tersimpan, dan progres privat |
| Privasi | Tergantung platform | Data privat per user dengan RLS |

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase Auth, Postgres, RLS
- Gemini via Vercel AI SDK
- Zod
- Vitest
- Vercel

## Struktur Utama

```txt
app/
  api/
    scenario/route.ts           # Generate skenario dan simpan ke DB
    roleplay/route.ts           # Balasan AI in-character standar
    roleplay-adaptive/route.ts  # Balasan AI adaptif berdasarkan eskalasi
    feedback/route.ts           # Skor drama dan feedback sesi
    summary/route.ts            # Pesan siap kirim pasca-feedback
    rewrite/route.ts            # Penerjemah nada
  auth/confirm/route.ts         # Callback magic link Supabase SSR
  demo/page.tsx                 # Demo publik tanpa login dan tanpa DB write
  history/page.tsx              # Semua riwayat latihan dan detail sesi
  progress/page.tsx             # Dashboard kemajuan user login
  saved-lines/page.tsx          # Semua kalimat tersimpan
  page.tsx                      # UI utama Bahas
  globals.css                   # Design tokens dan komponen visual
  primary-logo.svg              # Logo ikon
  long-logo.svg                 # Logo wordmark
lib/
  ai.ts                         # Fungsi AI: scenario, roleplay, feedback, summary, rewrite, risk
  ai.test.ts                    # Test checkRisk
  rate-limit.ts                 # Rate limit sederhana per user
  supabase/
    client.ts                   # Browser client
    server.ts                   # Server/API client
proxy.ts                        # Refresh session Supabase untuk Next.js 16
```

## Route Aplikasi

- `/`: halaman utama. Belum login menampilkan form magic link dan tombol demo; setelah login menampilkan workspace Bahas.
- `/demo`: simulasi publik untuk mencoba alur produk tanpa login.
- `/saved-lines`: semua kalimat andalan yang pernah disimpan user.
- `/history`: semua sesi roleplay yang sudah diakhiri, lengkap dengan chat, feedback, skor, dan pesan siap kirim.
- `/progress`: dashboard skor drama dari sesi yang tersimpan milik user.
- `/auth/confirm`: callback Supabase magic link.

## Alur Produk

1. User login dengan magic link, atau membuka `/demo` untuk simulasi tanpa akun.
2. User mengisi relasi, situasi, dan ketakutan.
3. Sistem mengecek kata risiko.
4. AI membuat naskah pembuka dan prediksi reaksi.
5. User masuk ke roleplay, memilih kesulitan, dan bisa mengaktifkan mode adaptif.
6. AI membalas sebagai lawan bicara.
7. User mengakhiri sesi dan mendapat skor drama.
8. User membuat pesan siap kirim dari hasil latihan.
9. User dapat menyalin atau menyimpan pesan ke kalimat andalan.
10. Halaman utama hanya menampilkan preview terbaru agar tetap ringkas.
11. User bisa membuka `/saved-lines`, `/history`, dan `/progress` dari dropdown akun untuk melihat data lengkap.

## Environment Variables

Buat `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

Jangan commit `.env.local`.

## Setup Lokal

```bash
npm install
npm run dev
```

Buka:

```txt
http://localhost:3000
```

Jika port 3000 sudah terpakai:

```bash
npm run dev -- --port 3001
```

Di PowerShell Windows, jika `npm` terkena execution policy, gunakan:

```bash
npm.cmd run dev -- --port 3001
```

## Database Supabase

Jalankan SQL berikut di Supabase SQL Editor:

```sql
create table public.scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  relation text not null,
  topic text,
  situation text not null,
  fear text,
  cultural_note text,
  opening_script text,
  predicted_reactions jsonb,
  created_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  scenario_id uuid references public.scenarios(id) on delete cascade,
  difficulty text not null default 'kalem',
  messages jsonb not null default '[]'::jsonb,
  drama_score int,
  feedback jsonb,
  summary_message text,
  created_at timestamptz not null default now()
);

create table public.saved_lines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  text text not null,
  source text,
  created_at timestamptz not null default now()
);

alter table public.scenarios enable row level security;
alter table public.conversations enable row level security;
alter table public.saved_lines enable row level security;

create policy "own scenarios" on public.scenarios
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own conversations" on public.conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own saved_lines" on public.saved_lines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Jika tabel `conversations` sudah dibuat sebelum fitur pesan siap kirim, jalankan migrasi tambahan ini:

```sql
alter table public.conversations
add column if not exists summary_message text;
```

## Supabase Auth Setup

Di Supabase Dashboard:

1. Buka **Authentication > URL Configuration**.
2. Set **Site URL** ke domain aplikasi:

```txt
https://your-vercel-domain.vercel.app
```

3. Tambahkan **Redirect URLs**:

```txt
https://your-vercel-domain.vercel.app/**
http://localhost:3000/**
http://localhost:3001/**
```

4. Buka **Authentication > Email Templates > Magic Link**.
5. Gunakan callback SSR:

```html
<a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink">
  Masuk ke Bahas
</a>
```

Jika email confirmation signup aktif, template confirm signup dapat memakai:

```html
<a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">
  Konfirmasi email
</a>
```

## Script

```bash
npm run dev       # Jalankan development server
npm run lint      # ESLint
npm run build     # Build production
npm exec vitest run
```

## Testing

Test saat ini fokus pada guardrail risiko:

```bash
npm exec vitest run
```

Target test:

- `checkRisk()` menandai kata risiko.
- Situasi biasa tidak ditandai berisiko.
- Rujukan bantuan muncul saat risiko terdeteksi.

Validasi yang disarankan sebelum deploy:

```bash
npm run lint
npm run build
npm exec vitest run
```

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Import repo di Vercel.
3. Set environment variables:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
GOOGLE_GENERATIVE_AI_API_KEY
```

4. Deploy.
5. Tambahkan domain Vercel ke Supabase Auth URL Configuration.
6. Pastikan SQL tabel, kolom `summary_message`, dan RLS sudah ada di Supabase.
7. Coba full flow: login magic link, buat skenario, roleplay, feedback, pesan siap kirim, simpan kalimat, buka `/saved-lines`, buka `/history`, dan buka `/progress`.

## Troubleshooting

### Magic link membuka error `requested path is invalid`

Biasanya redirect URL Supabase salah atau tidak memakai protocol lengkap. Pastikan URL memakai `https://`, bukan hanya `your-domain.vercel.app`.

Gunakan route:

```txt
/auth/confirm
```

dan template magic link seperti bagian Supabase Auth Setup.

### `email rate limit exceeded`

Supabase membatasi pengiriman magic link per project. UI akan menampilkan:

```txt
Anda terkena limit email. Tunggu beberapa menit sampai 1 jam, lalu coba lagi.
```

Di Supabase, limit ini bisa dilihat di **Authentication > Rate Limits**, bagian **Rate limit for sending emails**. Untuk production, pertimbangkan custom SMTP agar limit email lebih fleksibel.

### Endpoint mengembalikan 401

Pastikan user sudah login dan cookie session tersimpan. Cek juga `proxy.ts` tetap aktif karena file ini menyegarkan session Supabase di Next.js 16.

### Data tidak masuk tabel

Pastikan:

- User sudah login.
- SQL tabel sudah dibuat.
- Kolom `summary_message` sudah ada di `conversations`.
- RLS sudah aktif.
- Policy `auth.uid() = user_id` sudah dibuat.

### Log development menampilkan request Vite 404

Jika di terminal Next.js muncul 404 seperti `/@vite/client`, `/src/main.jsx`, atau `/dev-sw.js`, biasanya itu sisa cache service worker, tab lama, atau extension browser dari project Vite/PWA sebelumnya. Untuk Bahas yang memakai Next.js, cek halaman utama di `/`, `/demo`, `/saved-lines`, `/history`, dan `/progress`.

## Skenario Demo 2 Menit

1. Hook: "Kita sering tahu cara nabung, tapi tidak tahu cara ngomongin uang tanpa berantem."
2. Tunjukkan `/demo` untuk bukti value tanpa login.
3. Login dengan magic link.
4. Buat skenario: "Adik pinjam uang terus tapi tidak balikin."
5. Tampilkan naskah pembuka dan prediksi reaksi.
6. Masuk roleplay dengan mode `emosian` atau aktifkan mode adaptif.
7. Akhiri sesi dan tampilkan skor drama.
8. Buat pesan siap kirim, salin, atau simpan sebagai kalimat andalan.
9. Buka `/saved-lines` untuk menunjukkan kalimat tersimpan.
10. Buka `/history` untuk menunjukkan chat dan feedback sesi lama.
11. Buka `/progress` untuk menunjukkan tren skor.
12. Tutup dengan pesan: data privat, progres tersimpan, dan demo bisa dicoba tanpa akun.

## Status Implementasi

- Frontend utama: siap.
- Desain visual sesuai `DESIGN.md`: siap.
- Logo `primary-logo.svg` dan `long-logo.svg`: diterapkan.
- API routes: siap.
- Supabase Auth SSR callback: siap.
- Mode demo publik: siap.
- Dashboard kemajuan: siap.
- Halaman kalimat tersimpan: siap.
- Halaman riwayat latihan lengkap: siap.
- Pesan siap kirim: siap.
- Roleplay adaptif: siap.
- Modal logout profesional: siap.
- RLS dan tabel: perlu dijalankan di Supabase project masing-masing.
- Gemini: perlu API key valid.
- Deploy publik: via Vercel.

## Lisensi

Proyek ini dibuat sebagai MVP portfolio/kompetisi untuk tema literasi finansial.

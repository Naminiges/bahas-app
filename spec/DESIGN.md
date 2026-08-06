# design.md — Bahas (Design System)

> **Design System untuk Bahas** — panduan visual agar tampilan terasa seperti produk startup chat modern (Linear / Intercom / ChatGPT-grade).
> 

> Dokumen ini **hanya soal style**. Jangan ubah logic, state, atau nama fungsi apa pun. Tugasnya: menambah/mengganti `className`, token warna, tipografi, spacing, dan komponen visual.
> 

> **Brand primary: `#1800AD`** (deep indigo). Semua turunan warna di bawah dibangun dari sini.
> 

## 0. Prinsip Desain (baca dulu)

1. **Tenang & terpercaya.** Produk ini soal obrolan emosional — UI harus adem, lapang, tidak ramai. Banyak *whitespace*, sedikit garis.
2. **Satu warna berani, sisanya netral.** Indigo `#1800AD` hanya untuk aksi utama & aksen. Selebihnya abu-abu netral. Jangan warna-warni.
3. **Lembut & membulat.** Sudut membulat (radius besar), bayangan halus, transisi mulus. Hindari kesan kaku/korporat.
4. **Hierarki lewat ukuran & bobot, bukan garis.** Pakai tipografi & spacing untuk memisah, bukan border tebal.
5. **Aksesibel.** Kontras cukup, focus ring jelas, target sentuh ≥ 44px, hormati `prefers-reduced-motion`.

---

## 1. Token Warna

### 1.1 Brand (Primary) — dari `#1800AD`

| Token | Hex | Pemakaian |
| --- | --- | --- |
| `primary-50` | `#EFEBFF` | Background halus, hover chip |
| `primary-100` | `#DAD1FF` | Background aktif lembut, border fokus |
| `primary-200` | `#B9A8FF` | Ilustrasi, state disabled terang |
| `primary-300` | `#9478FF` | Aksen sekunder, gradient stop |
| `primary-400` | `#6E44FF` | Aksen terang, ujung gradient |
| `primary-500` | `#4A1FE0` | Hover tombol primary |
| `primary-600` | `#2E08C4` | Active/pressed |
| `primary-700` | `#1800AD` | **Brand base** (logo, tombol primary) |
| `primary-800` | `#13008A` | Teks di atas background terang |
| `primary-900` | `#0E0066` | Judul aksen gelap |

**Gradient brand** (hero, tombol utama, backdrop logo):

```css
--gradient-brand: linear-gradient(135deg, #1800AD 0%, #6E44FF 100%);
```

### 1.2 Netral (Slate)

| Token | Hex | Pemakaian |
| --- | --- | --- |
| `neutral-0` | `#FFFFFF` | Surface utama, kartu |
| `neutral-50` | `#F7F8FA` | Background halaman (app shell) |
| `neutral-100` | `#EEF0F4` | Bubble lawan bicara, divider halus |
| `neutral-200` | `#E2E5EC` | Border input, garis pemisah |
| `neutral-300` | `#CBD1DB` | Border hover, placeholder ring |
| `neutral-400` | `#9AA2B1` | Teks placeholder, ikon nonaktif |
| `neutral-500` | `#6B7280` | Teks sekunder |
| `neutral-600` | `#4B5563` | Teks body kalem |
| `neutral-700` | `#343A46` | Teks body utama |
| `neutral-800` | `#1F242E` | Judul |
| `neutral-900` | `#0E1116` | Judul tebal / near-black |

### 1.3 Semantik

| Token | Teks/Ikon | Background | Pemakaian |
| --- | --- | --- | --- |
| `success` | `#16A34A` | `#ECFDF3` | Berhasil, skor drama rendah |
| `warning` | `#D97706` | `#FFF7ED` | Perhatian, skor drama sedang |
| `danger` | `#DC2626` | `#FEF2F2` | Error, skor drama tinggi, kata risiko |
| `info` | `#1800AD` | `#EFEBFF` | Info, tips |

### 1.4 Warna khusus produk — Skala Skor Drama (0–100)

Warna dinamis mengikuti nilai (dipakai di meter feedback):

| Rentang | Warna | Arti |
| --- | --- | --- |
| 0–33 | `success #16A34A` | Adem, komunikasi sehat |
| 34–66 | `warning #D97706` | Mulai tegang |
| 67–100 | `danger #DC2626` | Nyaris meledak |

---

## 2. Tipografi

- **Font:** `Poppins`. Muat via `next/font` — lihat §8.
- **Judul:** tracking rapat (`-0.02em`), bobot 600–700.
- **Body:** `line-height` longgar (1.6) untuk keterbacaan obrolan.

| Peran | Ukuran | Bobot | Tracking | Pakai untuk |
| --- | --- | --- | --- | --- |
| Display | 48px / 3rem | 700 | -0.03em | Hero landing |
| H1 | 32px / 2rem | 700 | -0.02em | Judul halaman |
| H2 | 24px / 1.5rem | 600 | -0.02em | Judul section |
| H3 | 20px / 1.25rem | 600 | -0.01em | Sub-judul, judul kartu |
| Body-lg | 18px | 400 | 0 | Paragraf penting |
| Body | 16px | 400 | 0 | Teks utama, bubble chat |
| Body-sm | 14px | 400 | 0 | Teks sekunder, caption |
| Label | 13px | 600 | 0.02em | Label form, chip (uppercase opsional) |
| Mono | 14px | 400 | 0 | Skor, angka, kode |

---

## 3. Spacing, Radius, Shadow

### 3.1 Spacing (kelipatan 4px)

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`

Gunakan ritme longgar: padding kartu 24–32px, jarak antar-section 48–64px.

### 3.2 Radius

| Token | Nilai | Pakai |
| --- | --- | --- |
| `radius-sm` | 8px | Chip, badge |
| `radius-md` | 12px | Input, tombol |
| `radius-lg` | 16px | Kartu |
| `radius-xl` | 20px | Panel besar, modal |
| `radius-2xl` | 28px | Bubble chat |
| `radius-full` | 9999px | Avatar, pill, toggle |

### 3.3 Shadow (halus, berlapis)

```css
--shadow-xs: 0 1px 2px rgba(14,17,22,0.06);
--shadow-sm: 0 2px 8px rgba(14,17,22,0.06);
--shadow-md: 0 6px 20px rgba(14,17,22,0.08);
--shadow-lg: 0 16px 40px rgba(14,17,22,0.10);
--shadow-brand: 0 8px 24px rgba(24,0,173,0.24); /* untuk tombol primary & elemen brand */
```

---

## 4. Motion

| Token | Nilai | Pakai |
| --- | --- | --- |
| `dur-fast` | 120ms | Hover, tap |
| `dur-base` | 200ms | Transisi umum |
| `dur-slow` | 320ms | Masuk panel, modal |
| `ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elemen masuk |
- Bubble chat baru: *fade + slide-up* 8px, 200ms.
- Tombol: `transform: translateY(-1px)` + shadow naik saat hover.
- **Wajib**: bungkus animasi non-esensial dengan `@media (prefers-reduced-motion: reduce)` → matikan.

---

## 5. Komponen

### 5.1 Tombol

| Varian | Tampilan |
| --- | --- |
| **Primary** | Background `gradient-brand`, teks putih, `radius-md`, `shadow-brand`; hover naik 1px + `primary-500`. Aksi utama (Kirim link login, Buat naskah, Kirim). |
| **Secondary** | Background `neutral-0`, border `neutral-200`, teks `neutral-700`; hover border `neutral-300`  • `neutral-50`. |
| **Ghost** | Transparan, teks `primary-700`; hover background `primary-50`. Aksi tersier. |
| **Danger** | Teks/border `danger`; untuk hapus/aksi berisiko. |
- Tinggi: 44px (default), 52px (large/CTA hero), 36px (small).
- Padding horizontal: 20px. Bobot teks 600. Selalu ada `:focus-visible` ring `primary-200` 3px.

### 5.2 Input & Textarea

- Background `neutral-0`, border `1px neutral-200`, `radius-md`, padding 12–14px.
- **Focus:** border `primary-700` + ring `primary-100` (3px). Jangan pakai `outline` default browser.
- Placeholder `neutral-400`. Label `Label` style, `neutral-600`, jarak 6px di atas field.
- Textarea situasi: `min-height: 96px`, `resize-y`.

### 5.3 Kartu / Panel

- Background `neutral-0`, `radius-lg`, `shadow-sm`, padding 24px. Tanpa border (pakai shadow untuk pemisah).
- Panel naskah pembuka: aksen kiri `border-left: 3px solid primary-700` + background `primary-50`.

### 5.4 Tabs (Siapkan · Latihan · Terjemah nada)

- Pill toggle di dalam wadah `neutral-100`, `radius-full`.
- Tab aktif: background `neutral-0` + `shadow-xs` + teks `primary-700` (600). Tab nonaktif: teks `neutral-500`.
- Transisi 200ms.

### 5.5 Chat Bubble (inti produk)

| Pihak | Gaya |
| --- | --- |
| **Lawan bicara (AI in-character)** | Rata kiri, background `neutral-100`, teks `neutral-800`, `radius-2xl` (sudut kiri-bawah lebih kecil: `border-bottom-left-radius: 8px`). Avatar bulat inisial relasi (mis. "Adik"). |
| **Kamu (user)** | Rata kanan, background `gradient-brand`, teks putih, `radius-2xl` (sudut kanan-bawah `8px`). |
| **Sistem / rujukan** | Tengah, `body-sm`, `neutral-500`, italic, tanpa bubble. |
- Max-width bubble 78%. Jarak antar bubble 8px, antar giliran 16px.
- Indikator "sedang mengetik": tiga titik `neutral-400` animasi pulse.

### 5.6 Chip / Badge

- **Relasi** (Orang tua/Pasangan/Saudara): pill `primary-50` teks `primary-800`.
- **Kesulitan**: `kalem` → `success` bg/teks; `emosian` → `warning` bg/teks.
- Radius `radius-full`, padding 4×10px, `Label` style.

### 5.7 Meter Skor Drama

- Bar horizontal tinggi 10px, `radius-full`, track `neutral-100`.
- Isi bar pakai warna dinamis (§1.4) sesuai nilai; lebar = `skor%`.
- Angka besar `Mono` di atas bar + emoji status (😌 / 😬 / 🔥) opsional.
- Animasi lebar 320ms `ease-out` saat feedback muncul.

### 5.8 Empty State

- Ikon/ilustrasi lembut (mono `primary-200`), judul `H3`, deskripsi `body-sm neutral-500`, satu tombol primary. Mis. "Belum ada latihan. Mulai dari situasi pertamamu."

### 5.9 Callout Keamanan (kata risiko)

- Background `danger` bg (`#FEF2F2`), border-left 3px `danger`, ikon ⚠️, teks `neutral-700`. Tampilkan rujukan bantuan (SAPA 129 / 119 ext 8).

---

## 6. Layout & App Shell

- **Background halaman:** `neutral-50`. **Surface konten:** `neutral-0` di dalam kartu.
- **Lebar konten:** `max-width: 640px` (form/onboarding), `768px` (ruang roleplay), center dengan padding 16–24px.
- **Header aplikasi:** tinggi 60px, logo Bahas kiri, avatar user kanan, background `neutral-0` + `shadow-xs` sticky.
- **Landing/hero:** background `gradient-brand` atau putih dengan blob `primary-50`; headline `Display`, sub `body-lg neutral-600`, satu CTA primary besar.
- Grid 8pt, konsisten.

---

## 7. Logo & Brand Voice

- Logo memakai `#1800AD`. Beri ruang kosong (clear space) minimal setinggi huruf di sekelilingnya.
- Di background gelap, pakai logo versi putih; di terang, versi `primary-700`.
- **Nada tulisan UI:** hangat, santai, meyakinkan, Bahasa Indonesia sehari-hari. Contoh microcopy: tombol "Buat naskah", empty state "Yuk, ceritakan situasimu", loading "Menyusun naskah yang pas…".

---

## 8. Implementasi (Tailwind v4 — Next.js 15/16)

> Semua ini **hanya style**. Tidak menyentuh `lib/ai.ts`, API routes, atau state.
> 

### 8.1 `app/globals.css` — tempel token sebagai tema

```css
@import "tailwindcss";

@theme {
  /* Brand */
  --color-primary-50: #EFEBFF;
  --color-primary-100: #DAD1FF;
  --color-primary-200: #B9A8FF;
  --color-primary-300: #9478FF;
  --color-primary-400: #6E44FF;
  --color-primary-500: #4A1FE0;
  --color-primary-600: #2E08C4;
  --color-primary-700: #1800AD;
  --color-primary-800: #13008A;
  --color-primary-900: #0E0066;

  /* Netral */
  --color-neutral-50: #F7F8FA;
  --color-neutral-100: #EEF0F4;
  --color-neutral-200: #E2E5EC;
  --color-neutral-300: #CBD1DB;
  --color-neutral-400: #9AA2B1;
  --color-neutral-500: #6B7280;
  --color-neutral-600: #4B5563;
  --color-neutral-700: #343A46;
  --color-neutral-800: #1F242E;
  --color-neutral-900: #0E1116;

  /* Semantik */
  --color-success: #16A34A;
  --color-warning: #D97706;
  --color-danger: #DC2626;

  /* Font & radius */
  --font-sans: "Poppins", ui-sans-serif, system-ui, sans-serif;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-2xl: 28px;
}

:root {
  --gradient-brand: linear-gradient(135deg, #1800AD 0%, #6E44FF 100%);
  --shadow-sm: 0 2px 8px rgba(14,17,22,0.06);
  --shadow-md: 0 6px 20px rgba(14,17,22,0.08);
  --shadow-brand: 0 8px 24px rgba(24,0,173,0.24);
}

body {
  background: var(--color-neutral-50);
  color: var(--color-neutral-700);
  font-family: var(--font-sans);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

@layer components {
  .btn {
    display: inline-flex; align-items: center; justify-content: center;
    height: 44px; padding: 0 20px; border-radius: var(--radius-md);
    font-weight: 600; font-size: 15px; cursor: pointer;
    transition: transform .12s, box-shadow .2s, background .2s;
  }
  .btn:focus-visible { outline: 3px solid var(--color-primary-200); outline-offset: 2px; }
  .btn-primary { background: var(--gradient-brand); color: #fff; box-shadow: var(--shadow-brand); }
  .btn-primary:hover { transform: translateY(-1px); }
  .btn-secondary { background: #fff; color: var(--color-neutral-700); border: 1px solid var(--color-neutral-200); }
  .btn-secondary:hover { border-color: var(--color-neutral-300); background: var(--color-neutral-50); }
  .btn-ghost { background: transparent; color: var(--color-primary-700); }
  .btn-ghost:hover { background: var(--color-primary-50); }

  .input {
    width: 100%; padding: 12px 14px; border-radius: var(--radius-md);
    border: 1px solid var(--color-neutral-200); background: #fff; font-size: 16px;
    transition: border .2s, box-shadow .2s;
  }
  .input::placeholder { color: var(--color-neutral-400); }
  .input:focus { outline: none; border-color: var(--color-primary-700); box-shadow: 0 0 0 3px var(--color-primary-100); }

  .card { background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); padding: 24px; }

  .bubble { max-width: 78%; padding: 12px 16px; border-radius: var(--radius-2xl); font-size: 16px; }
  .bubble-them { background: var(--color-neutral-100); color: var(--color-neutral-800); border-bottom-left-radius: 8px; align-self: flex-start; }
  .bubble-me { background: var(--gradient-brand); color: #fff; border-bottom-right-radius: 8px; align-self: flex-end; }

  .chip { display:inline-flex; align-items:center; padding: 4px 10px; border-radius: 9999px; font-size: 13px; font-weight: 600; }
  .chip-relation { background: var(--color-primary-50); color: var(--color-primary-800); }
  .chip-kalem { background: #ECFDF3; color: var(--color-success); }
  .chip-emosian { background: #FFF7ED; color: var(--color-warning); }
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

### 8.2 Font via `next/font` (opsional, di `app/layout.tsx`)

```tsx
import { Poppins } from "next/font/google"
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans" })
// tambahkan className={poppins.variable} pada <html> atau <body>
```

### 8.3 Cara pakai (tanpa ubah logic)

- Ganti `className` elemen yang sudah ada. Contoh:
    - Tombol: `<button className="btn btn-primary">Buat naskah</button>`
    - Input: `<input className="input" .../>` (props & handler tetap)
    - Kartu: bungkus konten dengan `<div className="card">…</div>`
    - Bubble: `<div className="bubble bubble-them">…</div>` / `bubble-me`
- **Jangan** ubah nama fungsi, endpoint, atau alur data. Cukup atribut visual.

---

## 9. Checklist "Sudah Terlihat Profesional?"

- [ ]  Hanya satu warna berani (`#1800AD`) + netral; tidak norak.
- [ ]  Whitespace lega, radius membulat konsisten, shadow halus (bukan garis tebal).
- [ ]  Tombol primary pakai gradient brand + hover naik + focus ring.
- [ ]  Chat bubble beda jelas antara lawan bicara (kiri, abu) & user (kanan, brand).
- [ ]  Meter skor drama berwarna dinamis (hijau→kuning→merah).
- [ ]  Tipografi Poppins, judul tracking rapat, body line-height longgar.
- [ ]  Focus ring terlihat di semua elemen interaktif; kontras teks cukup.
- [ ]  `prefers-reduced-motion` dihormati.

*Halaman pendamping: PRD — Bahas (Single Source of Truth) & Guide — Bahas (Setup & Kode Lengkap).*
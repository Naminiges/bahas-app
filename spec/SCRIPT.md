# Pitch Deck & Script — Bahas (TOP 33 IndonesiaNEXT)

<aside>
⏰

**Deadline deck: Rabu, 29 Juli 2026 · 17.00 WIB** (Form Pengumpulan Pitch Deck). Pitching Hacker: **Kamis, 30 Juli 2026, 09.00 WIB** — 5' presentasi + 5' QnA.

</aside>

> **Bahas** — *"Latihan ngobrol uang, sebelum ngobrol beneran."*
> 

Style: **persuasif, energik, profesional-hacker.** PDF aktual berisi **10 slide** (slide 9 adalah CTA URL, slide 10 adalah closing) · 1 pesan besar per slide · sedikit teks, banyak visual. Warna brand **#1800AD** (indigo) + netral abu, satu aksen berani (lihat design system).

> **Patokan teknis saat menjawab:** gunakan implementasi aktual di repository sebagai sumber utama. Sebelum pitching, uji ulang alur produksi login → AI → simpan database; status HTTP 200 saja belum membuktikan seluruh alur end-to-end.

## Peta rubrik → strategi (role: Hacker)

| Kriteria | Bobot | Slide yang menyerang ini |
| --- | --- | --- |
| Project Comprehension | 30% | 2 (data keresahan), 3 (insight), 8 (kelayakan) |
| Role Competency | 30% | 5 (engine), 6 (AI moat) — **panggung utama kamu** |
| Enthusiasm & Motivation | 15% | 1 (hook), 10 (closing) |
| Leadership | 15% | 3 (visi celah pasar), 7 (Responsible AI) |
| Articulation | 10% | 4 (demo alur jernih) |

---

# Bagian 1 — Struktur & Isi Tiap Slide

## Slide 1 — The Hook

**Visual:** Layar hampir kosong, background gradient brand `#1800AD → #6E44FF`. Logo/kata **BAHAS** besar di tengah. Satu headline muncul.

**Headline:** *"Literasi finansial Indonesia bocor bukan karena angka — tapi karena DRAMA."*

**Sub (kecil):** 65 dari 100 orang dewasa RI sudah "melek" keuangan. Tapi obrolan uang paling penting justru tak pernah terjadi.

**Fokus rubrik:** Enthusiasm — energi pembuka kuat, hening 1 detik setelah headline.

## Slide 2 — Keresahan (bedah masalah)

**Visual:** 4 kartu ikon (radius besar, shadow halus). Di bawahnya 1 baris data + sumber kecil.

**4 keresahan inti:**

- 💸 Utang keluarga / saudara yang pinjam terus tak balik
- 🏠 Warisan yang tak jelas pembagiannya
- 💳 Pasangan beli barang mahal tanpa izin
- 🤐 Budaya "rezeki pasti diganti" & gengsi → obrolan dipendam

**Data (strip bawah):** *Masalah ekonomi konsisten jadi salah satu penyebab perceraian tertinggi di Indonesia — di PA Jember, 60% gugatan cerai 2022 dipicu masalah ekonomi.* Sumber: studi Pengadilan Agama Jember.

**Fokus rubrik:** Project Comprehension — masalah nyata, berdata, bukan asumsi.

## Slide 3 — Insight kontra-intuitif

**Visual:** Layar dibelah dua. Kiri (abu, pudar): ikon kalkulator/grafik = "Fintech lain". Kanan (brand, terang): ikon balon chat = "Bahas".

**Teks besar:** *"Fintech fokus pada APA yang kamu lakukan dengan uang. Bahas fokus pada BAGAIMANA cara membicarakannya."*

**1 baris:** Semua app ajarkan budget & nabung. Tak satupun menolong bagian tersulit: *percakapannya* dengan orang yang kita sayang.

**Fokus rubrik:** Leadership — visi tajam melihat celah pasar yang dilewatkan semua orang.

## Slide 4 — Solution (demo alur)

**Visual:** 3 langkah bernomor kiri→kanan, screenshot UI asli:

1. **Ceritakan situasi** (form: relasi + situasi + ketakutan)
2. **AI Roleplay** (chat bubble: kamu vs "Adik" in-character)
3. **Feedback + Skor Drama** — **METER dinamis hijau→kuning→merah (0–100)** ⬅️ *wow factor*

**Tagline:** *"Ceritakan sekali, latihan sampai berani."*

**Fokus rubrik:** Articulation — alur produk jernih dalam 3 kotak. (Meter Skor Drama = bukti kemampuan koding UI.)

## Slide 5 — The Hacker Engine

**Visual:** Diagram arsitektur modular. Alur aktualnya: `User → Frontend Next.js 16 → API Routes di Vercel → Gemini + Supabase Postgres (RLS)`. Gemini dan Supabase dipanggil sebagai dua layanan terpisah oleh API server.

**Poin:**

- Bukan "wrapper" chatbot — **arsitektur modular**: Frontend / API / Database terpisah, gampang di-debug & di-scale.
- **LLM = fungsi inti (INJECT)**, 5 peran: Classify · Generate · Act (roleplay) · Score · Transform.
- **6 endpoint AI auth-gated**: scenario · roleplay · roleplay-adaptive · feedback · rewrite · summary.
- Semua input endpoint divalidasi Zod; keluaran AI yang terstruktur divalidasi dengan schema. Secret Gemini disimpan di environment variable server.

**Fokus rubrik:** Role Competency — bukti *technical builder* sungguhan. (Sebut **"AI Debugging Loop": Capture → Feed → Root → Verify** saat cerita proses build.)

## Slide 6 — The AI Moat (kenapa bukan ChatGPT?)

**Visual:** Tabel 2 kolom ringkas — "ChatGPT/Gemini generik" vs "Bahas".

| ChatGPT generik | Bahas |
| --- | --- |
| Kotak kosong, harus jago prompt | Form terpandu → naskah otomatis |
| Lupa tiap sesi | Simpan skenario + skor drama per user (RLS) |
| Sulit konsisten in-character | Roleplay adaptif + **curveball** khas keluarga RI |
| Tak ada ukuran | Skor Drama 0–100 + pemicu/peredam terukur |

**Punchline:** *"Model umum bisa menjawab soal uang. Bahas bikin kamu siap & berani menghadapinya."*

**Fokus rubrik:** Role Competency — inovasi integrasi AI + riwayat latihan terstruktur dan privat sebagai fondasi personalisasi berikutnya.

## Slide 7 — Security & Responsible AI

**Visual:** Callout merah (danger) dengan ikon ⚠️ → panah ke kartu "Rujukan bantuan".

**Poin:**

- **Deteksi kata risiko deterministik** (KDRT / ancaman / judol parah) → panggilan AI dihentikan sebelum generasi pada alur skenario, roleplay, dan penerjemah nada.
- Sistem menampilkan rujukan **SAPA 129** dan **119 ext. 8 / Healing119.id** — AI dilarang berlagak konselor atau layanan darurat.
- **RLS aktif** di 3 tabel Postgres → data tiap user terisolasi & privat (`auth.uid() = user_id`).

**Punchline:** *"Responsible AI: manusia tetap pegang kendali penuh."*

**Fokus rubrik:** Leadership — tanggung jawab & kedewasaan produk.

## Slide 8 — Progress & Vision

**Visual:** Screenshot **grafik tren Skor Drama** antar sesi (dashboard `/progress`). Di samping terdapat tiga fitur yang di PDF masih diberi label *roadmap*.

**Poin:**

- **MVP tersedia di Vercel** — implementasinya menghubungkan input → AI → penyimpanan Supabase.
- Hasil per user: skor drama berbasis evaluasi AI terstruktur + kalimat pemicu/peredam + **1 pesan siap tempel ke WhatsApp**.
- **Sudah diimplementasikan:** `/demo` publik tanpa login dan tanpa DB write · Dashboard kemajuan · Lawan bicara adaptif + curveball.

**Fokus rubrik:** Project Comprehension — kelayakan & keberlanjutan jangka panjang.

## Slide 9 — CTA URL

**Visual:** URL besar `bahas-app.vercel.app`.

**Teks:** *"Selengkapnya dan demonya dapat dicoba di bahas-app.vercel.app."*

**Fokus rubrik:** Articulation — beri juri tujuan tindakan yang jelas.

## Slide 10 — Closing

**Visual:** Kembali ke background brand. Kalimat penutup besar + nama & role.

**Teks:** *"Literasi finansial sejati dimulai dari meja makan, bukan dari kalkulator."*

**Fokus rubrik:** Enthusiasm + Leadership — tutup dengan visi & ajakan.

---

# Bagian 2 — Pitch Script (5 Menit, per slide)

<aside>
🎯

Sebut role **Hacker** di awal. Tempo energik, jeda 1 detik tiap punchline. Presenter: **P N Shiddieqy** (ganti bila perlu). Pindah slide **tepat** di batas waktu tiap segmen.

</aside>

**Slide 1 — Hook · (0:00–0:20)**

> "Halo semuanya, saya **Putera**, Hacker di balik **Bahas**. Satu pertanyaan saya, kenapa keluarga yang sudah *melek* keuangan tetap bisa hancur gara-gara uang? Karena literasi finansial Indonesia bocor bukan karena angka — tapi karena **drama**. **65 dari 100** orang dewasa Indonesia sudah paham cara nabung dan budgeting. Tapi obrolan uang yang paling penting justru tak pernah terjadi"
> 

**Slide 2 — Keresahan · (0:20–0:45)**

> "Hayoo, gimana ngomong nya yaa, saudara ngutang terus, pembagian warisan tidak jelas, pasangan beli barang mahal diam-diam. bukan hanya itu, faktanya, masalah ekonomi jadi salah satu penyebab perceraian tertinggi; di Pengadilan Agama Jember, **60% gugatan cerai 2022** dipicu masalah ekonomi. Kita takut berantem, jadi kita **pendam** — sampai meledak."
> 

**Slide 3 — Insight · (0:45–1:05)**

> "Inilah celah yang dilewatkan **semua** aplikasi fintech. Mereka fokus pada *apa* yang kita lakukan dengan uang. Bahas fokus pada *bagaimana* cara membicarakannya. Semua app ajarkan budget dan investasi — tak satupun menolong bagian tersulit: **percakapannya** dengan orang yang kita sayang."
> 

**Slide 4 — Solution · (1:05–1:35)**

> "Perkenalkan: **Bahas**. Alurnya tiga langkah. **Satu** — user cukup ceritakan situasinya, misalnya 'adik pinjam uang terus tapi nggak balik'. **Dua** — sistem generate naskah pembuka *no-drama*, lalu user berlatih langsung lewat *roleplay* lawan AI yang memerankan si adik. **Tiga** — di akhir, user dapat **Skor Drama**: meter yang bergerak dari hijau ke merah. Ceritakan sekali, latihan sampai berani."
> 

**Slide 5 — The Hacker Engine · (1:35–2:25)**

> "Sekarang bagian Hacker-nya. Saya **tidak** membangun kotak chat biasa. Bahas memakai **arsitektur modular**: frontend Next.js 16 dan API server di Vercel, lalu API memanggil Gemini dan Supabase sebagai dua layanan terpisah. Ada **enam endpoint AI** yang semuanya mengecek sesi login dan memvalidasi input dengan Zod. Keluaran AI yang terstruktur juga harus lolos schema sebelum digunakan. LLM menjalankan lima peran: classify, generate, act, score, dan transform. Kunci Gemini hanya berada di environment variable server, bukan di browser. Proses debugging saya memakai loop **Capture, Feed, Root, Verify**: tangkap error persis, analisis konteksnya, cari akar masalah, lalu verifikasi hasilnya pada aplikasi dan database."
> 

**Slide 6 — The AI Moat · (2:25–3:10)**

> "'Tapi chatbot umum juga bisa, dong?' Modelnya mungkin bisa menjawab, tetapi Bahas memberi **alur latihan yang terstruktur**. User tidak perlu merancang prompt sendiri. Roleplay dapat menyesuaikan tingkat ketegangan dari respons terbaru dan pada giliran tertentu melempar *curveball* khas keluarga Indonesia. Setelah sesi selesai, Bahas menyimpan skenario, percakapan, skor, dan kalimat andalan per user dengan **Row Level Security**. Data itu sudah dipakai untuk riwayat dan dashboard progres; berikutnya dapat menjadi fondasi personalisasi yang lebih dalam. Jadi pembeda kami bukan sekadar modelnya, tetapi pengalaman latihan, pengukuran, guardrail, dan data terstruktur di sekelilingnya."
> 

**Slide 7 — Security & Responsible AI · (3:10–3:45)**

> "Topik ini emosional, jadi keamanan bukan opsi. Sebelum generasi pada alur skenario, roleplay, dan penerjemah nada, sistem menjalankan **deteksi kata risiko deterministik**. Jika terdeteksi KDRT, ancaman, atau krisis serius, panggilan AI dihentikan dan aplikasi menampilkan rujukan **SAPA 129** serta **119 ekstensi 8**. Di level data, Row Level Security membatasi baris berdasarkan `auth.uid() = user_id`. Bahas adalah alat latihan, bukan pengganti konselor atau layanan darurat."
> 

**Slide 8 — Progress & Vision · (3:45–4:25)**

> "Dan ini bukan sekadar mockup. **MVP-nya sudah tersedia di Vercel**. User dapat membuat skenario, berlatih, menerima evaluasi terstruktur, menyimpan sesi, dan membuat **satu pesan siap tempel ke WhatsApp**. Tiga fitur yang di slide ini masih tertulis sebagai roadmap sebenarnya sudah saya implementasikan: demo publik tanpa login dan tanpa menulis database, dashboard kemajuan, serta roleplay adaptif dengan curveball. Langkah berikutnya adalah pengujian ke lebih banyak pengguna, peningkatan guardrail, dan personalisasi berbasis riwayat dengan persetujuan user."
> 

**Slide 9 — CTA URL · (4:25–4:35)**

> "Demo dan penjelasan selengkapnya dapat dicoba di **bahas-app.vercel.app**."
> 

**Slide 10 — Closing · (4:35–5:00)**

> "Saya percaya, literasi finansial sejati dimulai dari **meja makan**, bukan dari kalkulator. Dengan Bahas, kita bantu jutaan keluarga bicara soal uang lebih sehat — tanpa drama. Saya **Putera**. **Mari kita Bahas.** Terima kasih!"
> 

---

# Bagian 3 — CEO Tips saat Tampil

- **Buka dashboard Supabase saat QnA teknis.** Tunjukkan ikon gembok **RLS aktif** di 3 tabel — bukti kamu paham privasi data user, bukan sekadar ngoding UI.
- **Ucapkan istilah "AI Debugging Loop" (Capture–Feed–Root–Verify).** Menunjukkan kedewasaan teknis & proses, bukan asal jadi.
- **Meter Skor Drama animatif** (hijau→kuning→merah, transisi 300ms sesuai implementasi). Ini wow-factor visual yang membuktikan skill front-end.
- **Sebut "secret hanya di environment variable server" & "auth-gated".** Ini lebih akurat daripada mengklaim tidak ada hardcode sama sekali; nama model, prompt, dan aturan risiko memang didefinisikan di source code.
- **Energi:** berdiri, tempo naik di punchline, jeda 1 detik setelah kalimat kunci. Kontak mata ke kamera.

## Siap-siap QnA (5 menit, jawab <1 menit/pertanyaan)

- **"Kenapa nggak cukup ChatGPT?"** → Slide 6: Bahas menyediakan form terpandu, roleplay in-character, evaluasi terstruktur, riwayat latihan, dashboard progres, dan data per user yang dibatasi RLS.
- **"Bagaimana skor drama dihitung?"** → Skor final dibuat Gemini dengan membaca percakapan lengkap, lalu hasilnya wajib sesuai schema Zod: bilangan bulat 0–100, maksimal 3 pemicu, maksimal 3 peredam, dan 1 saran. Estimasi cepat untuk mode adaptif berbeda: dihitung deterministik di browser dari kata tegang/tenang, tingkat kesulitan, dan nomor giliran.
- **"Data user aman?"** → RLS `auth.uid() = user_id` di tiap tabel, secret hanya di env, endpoint tolak 401 tanpa login.
- **"Bisnis model / skala?"** → MVP sekarang memakai layanan managed/serverless. Untuk skala besar, rate limiter in-memory perlu dipindahkan ke penyimpanan terdistribusi seperti Redis dan sistem perlu load test; dashboard progres sudah selesai, bukan roadmap.
- **"Kalau situasinya berbahaya (KDRT)?"** → Guardrail kata kunci deterministik menghentikan generasi pada alur skenario, roleplay, dan rewrite, lalu menampilkan rujukan. Akui bahwa ini guardrail MVP dan masih perlu diperluas dengan pengujian serta klasifikasi risiko berlapis.

---

# Bagian 4 — Data & Sumber (untuk strip data di slide)

| Klaim di deck | Angka | Sumber |
| --- | --- | --- |
| Literasi keuangan Indonesia | 65,43% (SNLIK 2024) | OJK |
| Literasi keuangan syariah (masih rendah) | 39,11% | OJK SNLIK 2024 |
| Masalah ekonomi = penyebab cerai tertinggi (lokal) | 60% gugatan cerai PA Jember 2022 | Studi Pengadilan Agama Jember |
| Keresahan asli komunitas | Thread r/finansial: "cara bertanya efektif soal keuangan ke keluarga/pasangan" | Reddit r/finansial (di PRD) |
| Rujukan kekerasan terhadap perempuan/anak | Hotline 129 · WhatsApp 08111-129-129 | [SAPA 129 — Kemen PPPA](https://laporsapa129.kemenpppa.go.id/) |
| Dukungan awal krisis psikologis | 119 ekstensi 8 · Healing119.id | [Kementerian Kesehatan](https://kesprimkom.kemkes.go.id/konten/145/151/0/cegah-bunuh-diri-dukung-kesehatan-jiwa-kenali-layanan-healing119-id) |

<aside>
💡

Angle hook: pakai **65%** untuk membalik ekspektasi — "kita sudah melek angka, tapi tetap ribut" → buktinya masalahnya di komunikasi, bukan literasi teknis. Itu yang bikin insight Slide 3 nendang.

</aside>

---

# Bagian 5 — Penguasaan Teknis Slide 5–6 (Hacker's Playbook)

<aside>
🎯

Ini **~60% nilaimu** (Role Competency). Target penguasaan: kamu bisa jelaskan tiap komponen **tanpa lihat slide**, dan jawab QnA teknis **<1 menit**. Kuasai *konsep*-nya, bukan hafalan kalimat.

</aside>

## A. Peta mental (kunci besar — hafalkan 3 ini)

Kalau blank di panggung, kembali ke 3 pilar ini:

1. **Arsitektur modular** — Frontend / API / Database terpisah. Bukan wrapper.
2. **LLM = fungsi inti** — bukan tempelan; 5 peran (classify, generate, act, score, transform).
3. **Data terstruktur + RLS** — skenario, sesi, skor, dan kalimat andalan tersimpan per user untuk riwayat serta progres; ini menjadi fondasi personalisasi berikutnya.

**One-liner pamungkas:** *"Bahas bukan kotak chat biasa — LLM menjalankan fungsi khusus di arsitektur modular, sedangkan data latihan per user disimpan terstruktur dan dibatasi di level database."*

## B. Slide 5 — Hacker Engine (kuasai ini)

### B1. Alur arsitektur (ucapkan sambil menunjuk tiap node)

`User → Frontend (Next.js 16) → API Routes di Vercel (auth gate) → Gemini + Supabase Postgres (RLS)`

- **User → Next.js:** UI tempat user isi form & roleplay.
- **Next.js → API Routes:** keenam endpoint AI lewat *gerbang auth*. Tanpa login = ditolak 401. Kunci Gemini **tidak pernah** ada di browser.
- **API → Gemini (via Vercel AI SDK):** server yang memanggil LLM, bukan client. Semua body request divalidasi Zod; hasil `generateObject` divalidasi schema, sedangkan balasan roleplay memakai `generateText`.
- **API → Supabase (Postgres + RLS):** simpan skenario, percakapan, skor — terisolasi per user.

### B2. Kenapa "modular" itu penting (jawaban siap tembak)

> "Karena tiap lapisan punya satu tanggung jawab. Kalau roleplay error, saya tahu masalahnya di layer AI, bukan di UI atau DB. Gampang di-debug, gampang di-scale, dan aman — kunci API terkurung di server."
> 

### B3. 5 peran LLM (WAJIB hafal + 1 contoh tiap peran)

| Peran | Tugas | Contoh nyata di Bahas |
| --- | --- | --- |
| **Classify** | Identifikasi topik dan konteks budaya | Dari situasi user → `topic` dan `cultural_note` |
| **Generate** | Buat naskah pembuka no-drama | Dari form → kalimat pembuka bicara ke "adik" |
| **Act** | Jadi lawan bicara in-character | Memerankan "adik" yang defensif + lempar curveball |
| **Score** | Evaluasi percakapan secara terstruktur | Gemini membaca percakapan → Skor Drama 0–100, pemicu, peredam, dan saran |
| **Transform** | Ubah konteks menjadi output siap pakai | Tulis ulang nada atau buat 1 pesan final siap tempel ke WhatsApp |

> **Guardrail risiko bukan peran Classify milik LLM.** `checkRisk()` adalah pemeriksaan substring deterministik yang dijalankan sebelum generasi pada route tertentu.

### B4. AI Debugging Loop — Capture → Feed → Root → Verify

Ceritakan ini untuk buktikan *kedewasaan proses*, bukan asal jadi:

- **Capture:** tangkap error/log persis (bukan "kayaknya error").
- **Feed:** umpankan konteks error itu ke AI untuk analisa.
- **Root:** cari akar masalah, bukan tambal gejala.
- **Verify:** buka database & pastikan data benar-benar masuk — *"saya nggak percaya buta, saya cek DB langsung."*

### B5. Istilah wajib kamu ucapkan (+ artinya, kalau ditanya)

- **Auth-gated:** tiap endpoint menolak request tanpa sesi login (401).
- **Schema-validated output:** hasil AI terstruktur dari `generateObject` dicocokkan ke bentuk data tetap sebelum dipakai. Balasan roleplay tetap berupa teks bebas dari `generateText`.
- **Secret management:** kunci Gemini berada di environment variable server. URL dan anon key Supabase memang tersedia ke client, tetapi akses data tetap dibatasi RLS.
- **Structured history:** Bahas menyimpan riwayat, skor, pesan siap kirim, dan kalimat andalan per user. Saat ini riwayat itu ditampilkan kembali sebagai history/progress, belum otomatis diambil seluruhnya untuk mempersonalisasi prompt AI.

### B6. ⚠️ Koreksi diagram Slide 5 (siapkan jawaban ini)

Di slide, Vercel muncul seolah langkah antara Gemini dan Supabase. Kalau juri menyorot: *"Vercel adalah tempat aplikasi Next.js dan API route di-deploy. Dari API route itu, server memanggil Gemini dan Supabase secara terpisah. Supabase tidak di-host di dalam Vercel."* Jawab santai, jangan defensif.

## C. Slide 6 — The AI Moat (kuasai ini)

### C1. Framing moat (kalimat kunci)

> "Model umum bisa **menjawab** soal uang. Bahas bikin user **siap & berani** menghadapinya. Bedanya bukan di model — tapi di produk & data di sekitarnya."
> 

### C2. 4 pembeda — jelaskan *kenapa juri harus peduli*

- **Form terpandu vs kotak kosong:** user awam tak perlu jago prompt; hasil konsisten.
- **Riwayat terstruktur + RLS:** skenario dan hasil sesi dapat dilihat kembali sebagai riwayat serta progres privat, bukan sekadar chat yang tercecer.
- **Roleplay adaptif + curveball vs sulit in-character:** lawan bicara terasa nyata & khas keluarga RI.
- **Skor Drama terstruktur vs tak ada ukuran:** ada evaluasi 0–100 beserta pemicu, peredam, dan saran, bukan sekadar "ngobrol".

### C3. Data terstruktur sebagai fondasi moat

> "Makin sering user latihan, makin lengkap riwayat skenario, percakapan, skor, dan kalimat andalannya. Saat ini data itu sudah memberi nilai lewat history dan dashboard progres. Dengan persetujuan user, tahap berikutnya adalah memakai pola riwayat tersebut untuk personalisasi. Jadi fondasi moat-nya sudah ada, tetapi saya tidak mengklaim model saat ini otomatis belajar dari seluruh data user."
> 

### C4. RLS dijelaskan (versi sederhana + teknis)

- **Versi juri awam:** "Akses data tiap user dibatasi di level database, bukan hanya disembunyikan oleh tampilan aplikasi."
- **Versi teknis:** "Ketiga tabel memakai Row Level Security dengan policy `auth.uid() = user_id`. Selama RLS dan policy aktif sesuai skema, query dengan sesi user hanya diizinkan mengakses baris miliknya."

### C5. Curveball / Adaptive Mode

> "Browser membuat estimasi ketegangan sementara dari pesan terbaru, mode kalem/emosian, dan nomor giliran. API memakai estimasi itu untuk meminta Gemini bersikap lebih defensif, waspada, atau melunak. Khusus giliran ketiga, prompt meminta satu *curveball* khas keluarga, misalnya mengungkit jasa masa lalu. Estimasi ini hanya mengatur roleplay dan bukan Skor Drama final."
> 

## D. Bank pertanyaan QnA teknis (drill sampai lancar)

- **"Ini cuma wrapper Gemini, kan?"** → "Bukan kotak chat biasa. Gemini mengisi fungsi-fungsi khusus di dalam alur produk: analisis skenario, naskah, roleplay, evaluasi, rewrite, dan pesan siap kirim. Di sekelilingnya ada auth, validasi, guardrail, RLS, penyimpanan sesi, dan dashboard progres."
- **"Kalau OpenAI/Google rilis fitur serupa?"** → "Model dapat diganti atau ditiru. Fokus Bahas ada pada workflow percakapan uang keluarga Indonesia, pengalaman latihan, evaluasi terstruktur, serta riwayat progres per user. Riwayat itu menjadi fondasi personalisasi berikutnya, bukan klaim bahwa model saat ini sudah belajar otomatis dari semua data."
- **"Skor Drama dihitung gimana?"** → "Untuk skor final, Gemini membaca seluruh percakapan dan menghasilkan skor 0–100, maksimal tiga pemicu, maksimal tiga peredam, serta satu saran. Zod memastikan format dan rentangnya valid. Secara terpisah, mode adaptif memakai estimasi deterministik ringan di browser untuk mengatur mood lawan bicara; estimasi itu bukan skor final."
- **"Data user aman?"** → "RLS `auth.uid() = user_id` di tiap tabel, secret di env, endpoint auth-gated (401 tanpa login)."
- **"Kenapa Supabase, bukan bikin sendiri?"** → "Postgres matang + Auth + RLS bawaan = keamanan level DB cepat, free-tier, fokus saya ke logika produk bukan reinvent infra."
- **"Halusinasi AI gimana?"** → "Input endpoint divalidasi Zod dan output terstruktur harus lolos schema. Roleplay tetap teks generatif, jadi prompt membatasi karakter dan panjang respons. Untuk kata risiko tertentu, guardrail deterministik menghentikan generasi lebih dulu. Ini mengurangi risiko, bukan menghilangkannya seratus persen."
- **"Bisa di-scale ke ribuan user?"** → "Frontend dan API serverless dapat diskalakan horizontal, sedangkan Supabase bisa dinaikkan kapasitasnya. Tetapi rate limiter MVP saat ini masih `Map` in-memory per instance. Sebelum ribuan user, saya akan pindahkan itu ke Redis/Upstash, menambah observability, dan melakukan load test."
- **"Bedanya sama konseling beneran?"** → "Bahas adalah alat latihan komunikasi, bukan diagnosis, konseling, atau layanan darurat. Pada kata risiko tertentu, sistem menghentikan generasi dan menampilkan rujukan bantuan."

## E. Cara drill (20 menit sebelum tampil)

1. Tutup slide. Gambar ulang **diagram arsitektur** dari ingatan di kertas (2×).
2. Sebut **5 peran LLM** + 1 contoh masing-masing, tanpa lihat (2×).
3. Jawab **8 pertanyaan Bagian D** keras-keras, target <1 menit/jawaban.
4. Ucapkan 4 istilah Bagian B5 dalam kalimat lengkap.
5. Rekam diri 90 detik jelaskan Slide 5–6 — dengar ulang, buang "eee".

---

# Bagian 6 — Perbedaan yang Tetap Ada antara PDF dan Sistem Aktual

Gunakan narasi terbaru di dokumen ini saat presentasi. PDF sudah dikumpulkan, sehingga perbedaan berikut cukup diluruskan secara lisan bila relevan:

| Lokasi PDF | Yang tertulis/tergambar di slide | Kondisi sistem aktual dan cara meluruskannya |
| --- | --- | --- |
| Slide 5 — diagram | Posisi logo dapat terbaca sebagai `Gemini → Vercel → Supabase` | Aplikasi Next.js dan API route di-deploy di Vercel. API route memanggil Gemini dan Supabase secara terpisah; Supabase bukan layanan yang di-host di Vercel. |
| Slide 5 — Hacker Engine | Slide tidak menampilkan versi framework atau jumlah endpoint | Sistem memakai Next.js 16 dan memiliki 6 endpoint AI auth-gated. Ini boleh dijelaskan secara lisan karena tidak bertentangan dengan teks slide. |
| Slide 6 — AI Moat | "Lupa tiap sesi" dan kesan bahwa Bahas sudah menjadi memori AI personal | Bahas memang menyimpan data terstruktur per user untuk history dan dashboard. Namun seluruh riwayat belum otomatis dimasukkan kembali ke prompt AI; sebut data itu sebagai fondasi personalisasi berikutnya. |
| Slide 7 — Responsible AI | Rujukan hanya menyebut SAPA 129 dan kalimat "AI otomatis berhenti" terdengar berlaku di semua proses | Implementasi menghentikan generasi pada route skenario, roleplay standar/adaptif, dan rewrite. Pesan aplikasi juga menyebut 119 ext. 8. Route feedback dan summary belum menjalankan `checkRisk()` secara terpisah. |
| Slide 8 — hasil | Tertulis "Skor Drama objektif" | Skor final adalah evaluasi Gemini yang dibatasi schema Zod. Sebut **evaluasi terstruktur**, bukan pengukuran objektif atau rumus deterministik. |
| Slide 8 — pipeline | Tertulis "pipeline stabil, sudah jalan end-to-end" | Gunakan klaim ini hanya setelah uji produksi terbaru berhasil: login, generate, roleplay, feedback, dan data benar-benar masuk Supabase. HTTP 200 pada halaman utama saja belum cukup. |
| Slide 8 — roadmap | `/demo`, dashboard kemajuan, dan lawan bicara adaptif masih disebut roadmap | Ketiganya sudah selesai di repository. Katakan: "Tiga item roadmap pada slide ini sudah saya implementasikan." Roadmap berikutnya adalah user testing, guardrail berlapis, dan personalisasi berbasis persetujuan. |
| Slide 8 — data moat | Kesan bahwa data otomatis membuat AI makin akurat setiap sesi | Saat ini data dipakai untuk history/progress, belum untuk training atau retrieval otomatis. Jangan mengatakan model belajar sendiri dari data user. |
| Slide 9–10 | Struktur lama di naskah menyebut closing sebagai slide 9 | PDF aktual memiliki 10 slide: slide 9 CTA URL dan slide 10 closing. Timing di Bagian 2 sudah disesuaikan. |

## Batas klaim teknis yang aman

- Jangan berkata **"semua output AI pasti tervalidasi schema"**. Hasil objek terstruktur tervalidasi; balasan roleplay berasal dari `generateText`.
- Jangan berkata **"tidak ada hardcode sama sekali"**. Secret Gemini ada di environment variable, tetapi nama model, prompt, daftar risiko, dan heuristik adaptif memang berada di source code.
- Jangan berkata **"tidak ada state di server"**. Rate limiter MVP memakai `Map` in-memory per instance.
- Jangan berkata **"RLS membuat kebocoran mustahil"**. Katakan RLS membatasi akses di level database selama policy aktif dan dikonfigurasi benar.
- Jangan berkata **"Skor Drama memakai rasio kata secara deterministik"**. Itu berlaku hanya sebagai ide kasar pada estimasi adaptif; skor final dibuat oleh Gemini dari percakapan lengkap.

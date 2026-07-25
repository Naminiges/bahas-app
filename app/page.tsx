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
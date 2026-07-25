import { describe, it, expect } from "vitest"
import { checkRisk } from "./ai"

describe("checkRisk", () => {
  it("menandai kata risiko", () => {
    expect(checkRisk("dia sering melakukan kekerasan").risky).toBe(true)
  })
  it("aman untuk situasi biasa", () => {
    expect(checkRisk("adik pinjam uang terus").risky).toBe(false)
  })
  it("mengembalikan rujukan saat risiko terdeteksi", () => {
    expect(checkRisk("aku takut karena ada ancaman").resource).toContain("SAPA 129")
  })
})

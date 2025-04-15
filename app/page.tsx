"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push("/hub-operations")
  }, [router])

  // Return a loading state while redirecting
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-white">Redirecting to hub operations...</div>
    </div>
  )
}

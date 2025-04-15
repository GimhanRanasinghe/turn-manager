"use client"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="bg-black text-white">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
          <p className="text-xl mb-8 text-center">We apologize for the inconvenience.</p>
          <Button onClick={reset}>Try again</Button>
        </div>
      </body>
    </html>
  )
}

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-xl mb-8 text-center">The page you are looking for does not exist or has been moved.</p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/flights">Go to Flights</Link>
        </Button>
        <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}

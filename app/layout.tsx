import type React from "react"
import type { Metadata } from "next"
import ClientComponent from "./client"
import { Open_Sans, Poppins } from "next/font/google"

// Initialize Open Sans font
const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
})

// Initialize Poppins font for titles
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "Turn Manager",
  description: "Real-time flight operations management system",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${openSans.variable} ${poppins.variable}`}>
      <ClientComponent children={children} />
    </html>
  )
}


import './globals.css'
import type { Metadata } from "next"
import { Geist, Geist_Mono, Rajdhani } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

// next/font loads fonts through Next.js so the browser does not need separate
// Google Font network requests. The variable names are used in globals.css.
const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontDisplay = Rajdhani({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "600"],
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// Metadata controls the browser tab title and default page description.
export const metadata: Metadata = {
  title: "Taskmaster | AI Powered Productivity",
  description:
    "An AI-assisted task manager for prioritizing work, planning your day, and staying motivated.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // Root layouts must include html and body tags in the App Router.
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "font-sans antialiased",
        geist.variable,
        fontDisplay.variable,
        fontMono.variable
      )}
    >
      <body>
        {/* ThemeProvider enables light/dark theme handling for shadcn components. */}
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}

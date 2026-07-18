import { clerkMiddleware } from "@clerk/nextjs/server"

// Next.js 16 calls this file Proxy (older Next versions called it Middleware).
// clerkMiddleware reads Clerk's session cookie before matched routes render,
// which allows auth() to identify the current user in pages and Server Actions.
export default clerkMiddleware()

export const config = {
  matcher: [
    // Run Clerk for app pages, but skip Next internals and static asset files.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Keep Clerk available if API or tRPC routes are added later.
    "/(api|trpc)(.*)",
    // Clerk uses this route internally for frontend API proxy support.
    "/__clerk/(.*)",
  ],
}

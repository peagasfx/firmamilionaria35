import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res }, {
       supabaseKey: "valor",
      supabaseUrl: "url"
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the user is authenticated
  if (!session) {
    // If the user is not authenticated and trying to access a protected route
    const url = req.nextUrl.clone()

    // Allow access to login and register pages
    if (url.pathname === "/login" || url.pathname === "/register") {
      return res
    }

    // Redirect to login for all other pages
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // If the user is authenticated and trying to access login or register
  if (session && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")) {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

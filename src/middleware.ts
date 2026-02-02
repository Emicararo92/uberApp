import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  console.log("🔥 MIDDLEWARE EJECUTADO:", req.nextUrl.pathname);

  const res = NextResponse.next();

  if (!req.nextUrl.pathname.startsWith("/admin")) {
    return res;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (user.app_metadata?.role !== "admin") {
    return NextResponse.redirect(new URL("/driver", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};

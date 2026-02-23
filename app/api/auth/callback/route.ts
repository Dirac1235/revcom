import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    console.error("[Auth Callback] No code provided in URL");
    return NextResponse.redirect(
      new URL("/auth/login?error=auth-code-error", request.url)
    );
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  try {
    // Exchange the code for a session
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error("[Auth Callback] Session exchange error:", sessionError.message);
      return NextResponse.redirect(
        new URL("/auth/login?error=auth-code-error", request.url)
      );
    }

    if (!data.user) {
      console.error("[Auth Callback] No user returned after session exchange");
      return NextResponse.redirect(
        new URL("/auth/login?error=auth-code-error", request.url)
      );
    }

    const user = data.user;
    console.log("[Auth Callback] User authenticated:", user.id);

    // Robust name extraction from user_metadata
    let firstName = "";
    let lastName = "";

    const metadata = user.user_metadata || {};

    // 1. Check for given_name and family_name (Google/Apple standard)
    if (metadata.given_name) {
      firstName = metadata.given_name;
    }
    if (metadata.family_name) {
      lastName = metadata.family_name;
    }

    // 2. If no given_name, try parsing full_name
    if (!firstName && metadata.full_name) {
      const nameParts = metadata.full_name.trim().split(/\s+/);
      firstName = nameParts[0] || "";
      lastName = nameParts.slice(1).join(" ") || "";
    }

    // 3. Fallback to name field
    if (!firstName && metadata.name) {
      const nameParts = metadata.name.trim().split(/\s+/);
      firstName = nameParts[0] || "";
      lastName = nameParts.slice(1).join(" ") || "";
    }

    // 4. If still no name, use email prefix as first name
    if (!firstName && user.email) {
      firstName = user.email.split("@")[0] || "User";
    }

    console.log("[Auth Callback] Extracted name:", { firstName, lastName });

    // Upsert profile into database
    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        avatar_url: metadata.avatar_url || metadata.picture || null,
        user_type: "both",
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      }
    );

    if (upsertError) {
      console.error("[Auth Callback] Profile upsert error:", upsertError.message);
      // Don't fail the auth if profile upsert fails - user is still logged in
      // But log it for debugging
    } else {
      console.log("[Auth Callback] Profile upserted successfully");
    }

    console.log("[Auth Callback] Redirecting to dashboard...");
    return NextResponse.redirect(new URL("/dashboard", request.url));

  } catch (error) {
    console.error("[Auth Callback] Unexpected error:", error);
    return NextResponse.redirect(
      new URL("/auth/login?error=auth-code-error", request.url)
    );
  }
}

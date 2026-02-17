"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/constants/routes";

const getVerificationRedirectUrl = () => {
  const hostedUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  const base = hostedUrl || "http://localhost:3000";
  return `${base}${ROUTES.SIGNUP_SUCCESS}`;
};

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const message = error.message.toLowerCase();

    if (
      message.includes("email not confirmed") ||
      message.includes("confirm your email")
    ) {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: getVerificationRedirectUrl() },
      });

      if (resendError) {
        return {
          error:
            "Please confirm your email. We could not resend the verification email.",
        };
      }

      return {
        error:
          "Please confirm your email. We sent you a new verification link.",
      };
    }

    return { error: error.message };
  }

  if (data.user && !data.user.email_confirmed_at) {
    return {
      error: "Please confirm your email. We sent you a new verification link.",
    };
  }

  revalidatePath("/", "layout");
  redirect(ROUTES.HOME);
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const lastName = formData.get("last_name") as string;
  const firstName = formData.get("first_name") as string;
  const userType = formData.get("userType") as "buyer" | "seller" | "both";

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getVerificationRedirectUrl(),
      data: {
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      email: email,
      first_name: firstName,
      last_name: lastName,
      user_type: userType,
    });

    if (profileError) {
      console.error("Error creating profile:", profileError);
    }
  }

  const { error: resendError } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: getVerificationRedirectUrl() },
  });

  if (resendError) {
    return {
      error:
        "Account created but we could not send the verification email. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  redirect(ROUTES.SIGNUP_SUCCESS);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(ROUTES.LOGIN);
}

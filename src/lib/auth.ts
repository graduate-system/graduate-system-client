"use server";

import { cookies } from "next/headers";

const COMMITTEE_PIN = process.env.COMMITTEE_PIN || "123456";
const COOKIE_NAME = "committee_auth";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

export async function verifyPin(pin: string): Promise<{ success: boolean; error?: string }> {
  if (!pin || pin.trim().length === 0) {
    return { success: false, error: "Please enter the committee PIN." };
  }

  if (pin.trim() !== COMMITTEE_PIN) {
    return { success: false, error: "Incorrect PIN. Please try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/dashboard",
  });

  return { success: true };
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === "authenticated";
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

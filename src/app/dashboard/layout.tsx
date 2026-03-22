import type { ReactNode } from "react";
import { isAuthenticated } from "@/lib/auth";
import { PinGate } from "./pin-gate";

export const metadata = {
  title: "Committee Dashboard | GradTrack Analytics — MUST",
  description: "Graduate employability analytics dashboard for MUST committee members.",
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const authed = await isAuthenticated();

  if (!authed) {
    return <PinGate />;
  }

  return <>{children}</>;
}

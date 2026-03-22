import { logout } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function DashboardPage() {
  async function handleLogout() {
    "use server";
    await logout();
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-amber-500 bg-gradient-to-br from-green-700 to-green-900 text-xs font-black text-amber-400">
              MUST
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400">Committee Dashboard</p>
              <p className="text-[11px] text-muted-foreground">GradTrack Analytics</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <form action={handleLogout}>
              <Button variant="outline" size="sm" type="submit">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-2xl font-black">Graduate Analytics Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Dashboard content coming soon — we&apos;ll build the interactive analytics next.
        </p>
      </main>
    </div>
  );
}

import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/alumni-connect-logo.jpg" alt="Alumni Connect logo" width={32} height={32} priority />
            <span className="text-lg font-semibold">Alumni Connect</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              Features
            </a>
            <a href="#signin" className="text-sm text-muted-foreground hover:text-foreground">
              Sign in
            </a>
          </div>
        </nav>

        <div className="mt-10 grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="space-y-4">
            <h1 className="text-pretty text-3xl font-bold tracking-tight md:text-5xl">
              Connect your college community across Students, Alumni, and Admins
            </h1>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              AI resume enhancements, fundraising with admin verification, daily streaks and achievements, and premium
              workshops—built for multi-college onboarding.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <a href="#signin">Get started</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="#features">See what&apos;s inside</a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Demo access available — sign in with any listed demo account.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 md:p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-md bg-background p-4">
                <div className="text-sm font-medium">AI Resume</div>
                <div className="mt-1 text-xs text-muted-foreground">Before/after and skill suggestions</div>
              </div>
              <div className="rounded-md bg-background p-4">
                <div className="text-sm font-medium">Fundraising</div>
                <div className="mt-1 text-xs text-muted-foreground">External payments + admin verification</div>
              </div>
              <div className="rounded-md bg-background p-4">
                <div className="text-sm font-medium">Streaks</div>
                <div className="mt-1 text-xs text-muted-foreground">Daily check-ins and leaderboards</div>
              </div>
              <div className="rounded-md bg-background p-4">
                <div className="text-sm font-medium">Workshops</div>
                <div className="mt-1 text-xs text-muted-foreground">Premium events and registrations</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

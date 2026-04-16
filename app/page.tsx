import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { AuthForm } from "@/components/auth/auth-form"

export default async function HomePage() {
  return (
    <main>
      {/* Hero */}
      <Hero />

      {/* Features */}
      <Features />

      {/* Sign in */}
      <section id="signin" aria-labelledby="signin-heading" className="border-t border-border bg-muted/50">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <AuthForm />
        </div>
      </section>
    </main>
  )
}

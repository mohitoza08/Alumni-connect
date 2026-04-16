export function Features() {
  const items = [
    {
      title: "AI Resume Enhancer",
      desc: "Improve resumes with before/after suggestions and skill highlights powered by AI—ready for job applications.",
    },
    {
      title: "Fundraising with Verification",
      desc: "Donors pay externally and submit a reference. Admins verify requests before totals update. “Complete payment externally, then submit transaction reference here for admin verification.”",
    },
    {
      title: "Streaks & Achievements",
      desc: "Daily check-ins for Students and Alumni with leaderboards, badges, and progress that encourages engagement.",
    },
  ]

  return (
    <section id="features" aria-labelledby="features-heading" className="bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h2 id="features-heading" className="text-pretty text-2xl font-semibold md:text-3xl">
          Everything you need to connect your community
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map((i) => (
            <article key={i.title} className="rounded-lg border border-border bg-background p-5">
              <h3 className="text-lg font-medium">{i.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{i.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

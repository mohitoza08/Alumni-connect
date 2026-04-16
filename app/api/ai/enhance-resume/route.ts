import { NextResponse } from "next/server"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"

export const dynamic = "force-dynamic"
export async function POST(req: Request) {
  let body: {
    bio?: string
    degree?: string
    major?: string
    graduationYear?: string
    currentCompany?: string
    currentPosition?: string
    isAlumni?: boolean
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  try {
    const { bio, degree, major, graduationYear, currentCompany, currentPosition, isAlumni } = body

    if (!bio || !bio.trim()) {
      return NextResponse.json({ error: "Bio is required" }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      const enhanced = enhanceBioFallback(bio)
      return NextResponse.json({
        enhancedBio: enhanced,
        message: "Using basic enhancement. Add GROQ_API_KEY to environment variables for AI-powered enhancement.",
      })
    }

    const groq = createGroq({
      apiKey: apiKey,
    })

    const context = []
    if (isAlumni) {
      context.push(`Role: Alumni`)
      if (currentPosition) context.push(`Current Position: ${currentPosition}`)
      if (currentCompany) context.push(`Current Company: ${currentCompany}`)
    } else {
      context.push(`Role: Student`)
    }
    if (degree) context.push(`Degree: ${degree}`)
    if (major) context.push(`Major: ${major}`)
    if (graduationYear) context.push(`Graduation Year: ${graduationYear}`)

    const contextStr = context.join(", ")

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: `You are a professional resume writer. Enhance the following bio to make it more professional, impactful, and achievement-oriented. Keep it concise (2-3 paragraphs max).

Context: ${contextStr}

Original Bio:
${bio}

Instructions:
- Use strong action verbs and quantifiable achievements where possible
- Maintain a professional yet personable tone
- Highlight relevant skills and experiences
- Keep the enhanced version approximately the same length or slightly longer
- Focus on impact and results
- Make it ATS-friendly (Applicant Tracking System)

Enhanced Bio:`,
    })

    return NextResponse.json({
      enhancedBio: text.trim(),
      message: "Bio enhanced using AI",
    })
  } catch (error) {
    console.error("Error enhancing bio:", error)

    const enhanced = enhanceBioFallback(body.bio || "")

    return NextResponse.json({
      enhancedBio: enhanced,
      message: "AI enhancement failed, using basic enhancement",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

// Fallback enhancement function when API key is not available
function enhanceBioFallback(bio: string): string {
  if (!bio || !bio.trim()) return bio

  // Basic text improvements
  let enhanced = bio.trim()

  // Ensure proper capitalization
  enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1)

  // Add period at end if missing
  if (!/[.!?]$/.test(enhanced)) {
    enhanced += "."
  }

  // Replace common weak phrases with stronger alternatives
  const replacements: Record<string, string> = {
    "I am": "Demonstrated",
    "I have": "Possess",
    "I worked": "Collaborated",
    "responsible for": "managed",
    "helped with": "contributed to",
    did: "executed",
    made: "developed",
  }

  for (const [weak, strong] of Object.entries(replacements)) {
    const regex = new RegExp(weak, "gi")
    enhanced = enhanced.replace(regex, strong)
  }

  return enhanced
}

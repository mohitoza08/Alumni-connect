// Helper to read the session token from requests
export function getSessionTokenFromHeaders(req: Request): string | undefined {
  // Client sends token as 'x-session-token' header
  // Fallback to query param for convenience in debugging.
  const token = req.headers.get("x-session-token") || new URL(req.url).searchParams.get("token") || undefined
  return token || undefined
}

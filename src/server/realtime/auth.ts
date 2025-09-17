export interface Session {
  id: string;
  userId: string;
}

export async function requireSession(request: Request): Promise<Session> {
  const auth = request.headers.get("authorization");
  if (!auth) {
    return { id: crypto.randomUUID(), userId: "anonymous" };
  }
  if (auth.startsWith("Bearer ")) {
    const token = auth.slice(7).trim();
    return { id: crypto.randomUUID(), userId: token || "anonymous" };
  }
  return { id: crypto.randomUUID(), userId: "anonymous" };
}

export interface Session {
  id: string;
  userId: string;
}

export async function requireSession(request: Request): Promise<Session> {
  const auth = request.headers.get("authorization");
  if (!auth) {
    return { id: crypto.randomUUID(), userId: "anonymous" };
  }
  return { id: crypto.randomUUID(), userId: auth.replace("Bearer", "").trim() || "anonymous" };
}

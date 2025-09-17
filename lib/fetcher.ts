import { z } from "zod";

/**
 * Perform a typed fetch that validates the response with a zod schema.
 */
export async function fetcher<T extends z.ZodTypeAny>(
  input: RequestInfo,
  init: RequestInit,
  schema: T
): Promise<z.infer<T>> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return schema.parse(data);
}

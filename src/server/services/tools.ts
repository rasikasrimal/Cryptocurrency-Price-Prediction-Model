interface Tool {
  id: string;
  name: string;
  description: string;
}

const registry: Tool[] = [
  { id: "web-search", name: "Web Search", description: "Queries indexed sources." },
  { id: "code-executor", name: "Code Executor", description: "Runs sandboxed code." }
];

export function listTools() {
  return registry;
}

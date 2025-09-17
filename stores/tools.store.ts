import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface ToolsState {
  tools: ToolDefinition[];
  toggleTool: (id: string) => void;
  upsertTool: (tool: ToolDefinition) => void;
}

const initial: ToolDefinition[] = [
  {
    id: "web-search",
    name: "Web Search",
    description: "Retrieves the latest information from the web.",
    enabled: true
  },
  {
    id: "code-executor",
    name: "Code Executor",
    description: "Runs TypeScript snippets in a secure sandbox.",
    enabled: false
  }
];

export const useToolsStore = create<ToolsState>()(
  devtools((set) => ({
    tools: initial,
    toggleTool: (id) =>
      set((state) => ({
        tools: state.tools.map((tool) =>
          tool.id === id ? { ...tool, enabled: !tool.enabled } : tool
        )
      })),
    upsertTool: (tool) =>
      set((state) => ({
        tools: state.tools.some((t) => t.id === tool.id)
          ? state.tools.map((t) => (t.id === tool.id ? tool : t))
          : [...state.tools, tool]
      }))
  }))
);

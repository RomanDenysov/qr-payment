interface ModelContextTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<
      string,
      {
        type: string;
        description?: string;
        enum?: readonly string[];
      }
    >;
    required?: readonly string[];
  };
  execute(args: Record<string, unknown>): Promise<{
    content: Array<{ type: string; text: string }>;
    isError?: boolean;
  }>;
}

interface ModelContext {
  registerTool(tool: ModelContextTool): unknown;
  unregisterTool(name: string): void;
}

interface Navigator {
  modelContext?: ModelContext;
}

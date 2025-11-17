// Possible actions the LLM can emit.
export type AgentAction =
  | {
      action: "run_task";
      params: {
        task: string;
        payload?: Record<string, any>;
      };
    }
  | {
      action: "finish";
      params: {
        result: string;
      };
    };

// Safe JSON parse with error handling
export function parseAction(json: string): AgentAction {
  try {
    const data = JSON.parse(json);

    if (!data.action || !data.params) {
      throw new Error("Malformed action");
    }

    return data as AgentAction;
  } catch (err) {
    console.error("Failed to parse LLM action:", json);
    throw err;
  }
}

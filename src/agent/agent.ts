import { PlanLlama } from "planllama/src/client";
import { callLLM } from "./openai";
import { parseAction, AgentAction } from "./schema";
import { initTasks } from "./tasks";

const SYSTEM_PROMPT = `
You are a workflow planning agent.

You MUST respond only in JSON.

Actions:
1. {"action":"run_task","params":{"task":string,"payload":object}}
2. {"action":"finish","params":{"result":string}}

Available tasks:
{{tasks}}

Rules:
- Always respond with valid JSON.
- If you encounter an error, you must handle it gracefully and return a valid JSON response.

Do not output explanations.
`;

export async function runAgent(
  planLlama: PlanLlama,
  goal: string,
  context: any = {},
  onLog?: (message: string, type: 'info' | 'action' | 'result' | 'error') => void
) {
  const log = (message: string, type: 'info' | 'action' | 'result' | 'error' = 'info') => {
    console.log(`[${type.toUpperCase()}]`, message);
    onLog?.(message, type);
  };

  log('Initializing agent...', 'info');
  const tasks = await initTasks(planLlama);
  log(`Available tasks: ${tasks.map(t => t.name).join(', ')}`, 'info');

  const history = [
    {
      role: "system",
      content: SYSTEM_PROMPT.replace(
        "{{tasks}}",
        tasks.map((t) => `- "${t.name}": ${t.description}`).join("\n\n")
      ),
    },
    {
      role: "user",
      content: `Goal: ${goal}\nContext: ${JSON.stringify(context)}`,
    },
  ];

  while (true) {
    log('Calling LLM...', 'info');
    const llmOutput = await callLLM(history);

    let action: AgentAction;
    try {
      action = parseAction(llmOutput);
    } catch (err) {
      log(`Invalid JSON response: ${err}`, 'error');
      // Tell LLM the JSON was bad and retry
      history.push({ role: "assistant", content: llmOutput });
      history.push({
        role: "system",
        content: "Your previous response was invalid JSON. Fix it.",
      });
      continue;
    }

    if (action.action === "run_task") {
      const { task, payload } = action.params;
      log(`Executing task: ${task}`, 'action');
      log(`Payload: ${JSON.stringify(payload)}`, 'info');
      const result = await planLlama.request(task, payload);
      log(`Task result: ${JSON.stringify(result)}`, 'result');

      // Feed result back to LLM
      history.push({
        role: "assistant",
        content: llmOutput, // original action
      });

      // Use 'user' role instead of 'tool' for feedback
      history.push({
        role: "user",
        content: `Task "${task}" completed. Result: ${JSON.stringify({
          task,
          result,
        })}`,
      });

      continue;
    }

    if (action.action === "finish") {
      log('Agent finished', 'info');
      log(`Final result: ${action.params.result}`, 'result');
      return action.params.result;
    }
  }
}

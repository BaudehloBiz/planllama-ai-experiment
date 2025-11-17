import { Job, PlanLlama } from "planllama/src/client";

export interface TaskDescription {
  name: string;
  description: string;
}

export async function initTasks(
  planLlama: PlanLlama
): Promise<TaskDescription[]> {
  const tasks: TaskDescription[] = [
    planLlamaTask(
      planLlama,
      "fetch_data",
      "Fetch data from a specified source.",
      async (payload: { source: "capa" | "search"; searchTerm: string }) => {
        console.log("Fetching data with payload:", payload);
        return payload;
      }
    ),
    planLlamaTask(
      planLlama,
      "process_data",
      "Process previously fetched data.",
      async (payload: { data: any }) => {
        console.log("Processing data with payload:", payload);
        return payload;
      }
    ),
  ];

  return tasks;
}

function planLlamaTask(
  planLlama: PlanLlama,
  name: string,
  description: string,
  func: (payload: any) => Promise<any>
): TaskDescription {
  planLlama.work(name, async (job: Job): Promise<any> => {
    console.log(`Executing task "${name}" with payload:`, job.data);
    const result = await func(job.data);
    console.log(`Task "${name}" completed with result:`, result);
    return result;
  });
  return { name, description };
}

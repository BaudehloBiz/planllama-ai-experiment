import OpenAI from "openai";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function callLLM(messages: any[]) {
  console.log("Calling LLM with messages:", messages);
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages,
    response_format: { type: "json_object" },
  });

  return response.choices[0].message.content!;
}

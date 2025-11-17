import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});

async function testOpenAI() {
  console.log("Testing OpenAI API...");
  console.log("API Key:", process.env.VITE_OPENAI_API_KEY ? "SET" : "NOT SET");

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {role: "system", content: "You are a helpful assistant."},
        {role: "user", content: "Say hello in JSON format with a 'message' field."}
      ],
      response_format: {type: "json_object"},
    });

    console.log("\n✅ Success!");
    console.log("Response:", response.choices[0].message.content);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.status) {
      console.error("Status:", error.status);
    }
    if (error.code) {
      console.error("Code:", error.code);
    }
    if (error.type) {
      console.error("Type:", error.type);
    }
  }
}

testOpenAI();

import { Client } from "@langchain/langgraph-sdk";

const client = new Client({ apiUrl: "http://localhost:2024" });

const questions = [
  "who am I",
  "what happens in picture 14",
  "what did I do on october 30",
  "what was my first question"
];

async function runChatSimulation() {
  console.log("🔵 Starting Chat Simulation...\n");

  try {
    // 1. Connect
    const assistants = await client.assistants.search();
    const assistantId = assistants[0]?.assistant_id || "agent";
    console.log(`✅ Connected to Assistant: "${assistantId}"`);

    // 2. Create Thread
    const thread = await client.threads.create();
    const threadId = thread.thread_id;
    console.log(`🧵 Conversation Thread ID: ${threadId}\n`);
    console.log("--------------------------------------------------");

    // 3. Loop through questions
    for (const question of questions) {
      console.log(`👤 User: ${question}`);
      process.stdout.write("🤖 Agent: ");

      const stream = client.runs.stream(
        threadId,
        assistantId,
        {
          input: { messages: [{ role: "user", content: question }] },
          streamMode: "values"
        }
      );

      let lastPrintedMessageId = null;

      for await (const chunk of stream) {
        // In 'values' mode, chunk.data is the entire state (e.g. { messages: [...] })
        if (chunk.event === "values" && chunk.data.messages) {
          const messages = chunk.data.messages;
          const lastMessage = messages[messages.length - 1];

          // Only print if it's an AI message and we haven't printed it yet
          if (lastMessage.type === "ai" || lastMessage.role === "assistant") {
            // Simple check to avoid re-printing the same message multiple times 
            // (since 'values' emits every time the state updates)
            if (lastMessage.id !== lastPrintedMessageId && lastMessage.content) {
              console.log(lastMessage.content);
              lastPrintedMessageId = lastMessage.id || "unknown"; 
            }
          }
        }
      }
      console.log("--------------------------------------------------");
    }

    console.log("\n✅ Simulation Finished.");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
}

runChatSimulation();

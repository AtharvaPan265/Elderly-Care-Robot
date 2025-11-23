import { Client } from "@langchain/langgraph-sdk";

// Initialize the client pointing to your local LangGraph server
const client = new Client({
  apiUrl: "http://localhost:2024", // Default 'langgraph dev' port
});

const ASSISTANT_ID = "agent"; // Default assistant ID

/**
 * Creates a new conversation thread.
 * @returns {Promise<string>} The new thread_id.
 */
export async function createThread() {
  const thread = await client.threads.create();
  return thread.thread_id;
}

/**
 * Sends a user message to a specific thread and returns the agent's response.
 * @param {string} threadId - The ID of the thread to send the message to.
 * @param {string} userMessage - The text content of the user's message.
 * @returns {Promise<string>} The text content of the agent's final response.
 */
export async function sendMessage(threadId, userMessage) {
  // 1. Start the run and wait for it to complete
  await client.runs.wait(
    threadId,
    ASSISTANT_ID,
    {
      input: {
        messages: [
          { role: "user", content: userMessage },
        ],
      },
    }
  );

  // 2. Fetch the final state of the thread to get the new messages
  const state = await client.threads.getState(threadId);

  // 3. Extract the last message (assuming standard "messages" key in state)
  const messages = state.values.messages;
  const lastMessage = messages[messages.length - 1];

  // Return the content (works for both string content and complex content arrays)
  if (typeof lastMessage.content === 'string') {
    return lastMessage.content;
  }
  
  // Handle cases where content might be an array (e.g. multimodal)
  return JSON.stringify(lastMessage.content);
}

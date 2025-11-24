import { createThread, sendMessage, sendStatelessMessage } from "./agentClient.js";

// --- Configuration ---
const QUESTIONS_SET_A = [
  "hi",
  "who am I",
  "what happens in picture 18",
  "what did I do on october 30"
];

const QUESTIONS_SET_B = [
 "hi",
  "who am I",
  "what happens in picture 14",
  "what did I do on November 6"
];

// --- Helper for logging ---
function logSection(title) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🔹 ${title.toUpperCase()}`);
  console.log(`${"=".repeat(60)}\n`);
}

function logStep(step) {
  console.log(`\n🔸 ${step}`);
}

// --- Main Test Runner ---
async function runComprehensiveTest() {
  try {
    logSection("Starting Comprehensive Agent Test");

    // =================================================================
    // PHASE 1: Thread 1 - Initial Conversation
    // =================================================================
    logSection("Phase 1: Thread A (Initial Conversation)");
    const threadId_A = await createThread();
    console.log(`🧵 Created Thread A: ${threadId_A}`);

    for (const q of QUESTIONS_SET_A) {
      logStep(`Thread A | User: "${q}"`);
      const ans = await sendMessage(threadId_A, q);
      console.log(`🤖 Agent: ${ans}`);
    }

    logStep(`Thread A | User: "Recollect our conversation"`);
    const recall_A1 = await sendMessage(threadId_A, "Please summarize what we just talked about.");
    console.log(`🤖 Agent: ${recall_A1}`);


    // =================================================================
    // PHASE 2: Thread 2 - New Independent Conversation
    // =================================================================
    logSection("Phase 2: Thread B (New Conversation)");
    const threadId_B = await createThread();
    console.log(`🧵 Created Thread B: ${threadId_B}`);

    for (const q of QUESTIONS_SET_B) {
      logStep(`Thread B | User: "${q}"`);
      const ans = await sendMessage(threadId_B, q);
      console.log(`🤖 Agent: ${ans}`);
    }

    logStep(`Thread B | User: "Recollect our conversation"`);
    const recall_B1 = await sendMessage(threadId_B, "Please summarize what we just talked about.");
    console.log(`🤖 Agent: ${recall_B1}`);


    // =================================================================
    // PHASE 3: Thread 1 - Reconnection & Memory Check
    // =================================================================
    logSection("Phase 3: Reconnecting to Thread A");
    console.log(`🔄 Switching back to Thread A: ${threadId_A}`);

    logStep(`Thread A | User: "Recollect our conversation again"`);
    const recall_A2 = await sendMessage(threadId_A, "Do you remember who I am and what picture I asked about?");
    console.log(`🤖 Agent: ${recall_A2}`);


    // =================================================================
    // PHASE 4: Stateless Messages (Amnesia Test)
    // =================================================================
    logSection("Phase 4: Stateless Messages");

    // Stateless Message 1
    logStep(`Stateless | User: "My secret number is 999"`);
    const stateless_1 = await sendStatelessMessage("My secret number is 999.");
    console.log(`🤖 Agent: ${stateless_1}`);

    // Stateless Message 2 (Should NOT remember the previous one)
    logStep(`Stateless | User: "What is my secret number?" (Expect Amnesia)`);
    const stateless_2 = await sendStatelessMessage("What is my secret number?");
    console.log(`🤖 Agent: ${stateless_2}`);


    // =================================================================
    // PHASE 5: Thread 2 - Final Check
    // =================================================================
    logSection("Phase 5: Final Check on Thread B");
    console.log(`🔄 Switching back to Thread B: ${threadId_B}`);

    logStep(`Thread B | User: "Recollect our conversation"`);
    const recall_B2 = await sendMessage(threadId_B, "What Picture did I ask about earlier?");
    console.log(`🤖 Agent: ${recall_B2}`);


    logSection("Test Complete ✅");

  } catch (error) {
    console.error("\n❌ TEST FAILED:", error);
  }
}

runComprehensiveTest();

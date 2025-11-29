# Standard library imports
import os
from typing import Annotated, Sequence, TypedDict

# Third-party imports
from dotenv import load_dotenv
from langchain_core.messages import BaseMessage

# --- OLLAMA IMPORT ---
# pip install -U langchain-ollama
from langchain_ollama import ChatOllama

from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition

# Local imports
from tools import (
    get_dates_of_written_logs,
    read_log,
    write_log,
    read_logs_range,
    web_search,
    get_image_info,
    get_datetime,
)
from functions import get_system_message

# Load environment variables
load_dotenv(".env")
os.environ["TAVILY_API_KEY"] = os.getenv("TAVILY_API_KEY")  # Needed for web_search tool


# Define the state
class ChatState(TypedDict):
    """The state of the chat."""

    messages: Annotated[Sequence[BaseMessage], add_messages]


# --- INITIALIZE OLLAMA ---
# Make sure to run `ollama pull llama3.1` (or your preferred model) first!
llm = ChatOllama(
    model="qwen3:4b",  # Change to "mistral", "gemma2", etc. as needed
    temperature=0.7,
    # num_ctx=60000,
)

# Define your tools list
tools = [
    get_dates_of_written_logs,
    read_log,
    write_log,
    read_logs_range,
    web_search,
    get_image_info,
    get_datetime,
]

# Bind tools to the LLM
# Note: Llama 3.1 supports tool calling natively in LangChain
llm_with_tools = llm.bind_tools(tools)


def chat_node(state: ChatState):
    """Process messages with Ollama."""

    current_history = state["messages"]
    _ = len(current_history)  # Force history load

    # Ollama sometimes handles system prompts better when they are distinct
    # but LangChain handles the merging.
    messages = [get_system_message()] + list(current_history)

    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}


# Create the graph
workflow = StateGraph(ChatState)

# Add nodes
workflow.add_node("chat", chat_node)
tool_node = ToolNode(tools=tools)
workflow.add_node("tools", tool_node)

# Set edges
workflow.add_edge(START, "chat")
workflow.add_conditional_edges(
    "chat",
    tools_condition,
)
workflow.add_edge("tools", "chat")

# Compile
graph = workflow.compile()

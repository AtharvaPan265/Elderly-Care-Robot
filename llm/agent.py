# Standard library imports
import os
from typing import Annotated, Sequence, TypedDict
import re

# Third-party imports
from dotenv import load_dotenv
from langchain_core.messages import BaseMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition

# Local imports
from tools import write_to_daily_file, read_daily_file, web_search
from functions import get_system_message

# Load environment variables
load_dotenv(".env")
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")
os.environ["TAVILY_API_KEY"] = os.getenv("TAVILY_API_KEY")

# Define the state
class ChatState(TypedDict):
    """The state of the chat."""
    messages: Annotated[Sequence[BaseMessage], add_messages]

# Initialize Gemini model
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-lite",
    temperature=0.7,
    max_retries=2,
)

# Define your tools list
tools = [write_to_daily_file, read_daily_file, web_search]

# Bind tools to the LLM - this tells the LLM what tools are available
llm_with_tools = llm.bind_tools(tools)

def chat_node(state: ChatState):
    """Process messages with Gemini."""
    messages = [get_system_message()] + list(state["messages"])
    # Use llm_with_tools instead of llm
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

# Create the graph
workflow = StateGraph(ChatState)

# Add the chat node
workflow.add_node("chat", chat_node)

# Add the tool node - this executes the tools when called
tool_node = ToolNode(tools=tools)
workflow.add_node("tools", tool_node)

# Set entry point using START
workflow.add_edge(START, "chat")

# Add conditional edges - routes to tools if LLM requests them, otherwise END
workflow.add_conditional_edges(
    "chat",
    tools_condition,  # Built-in function that checks for tool calls
)

# After tools execute, return to chat node
workflow.add_edge("tools", "chat")

# Compile the graph - this is what langgraph.json references
graph = workflow.compile()
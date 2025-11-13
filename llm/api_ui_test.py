import streamlit as st
import requests
import json

# Configure the page
st.set_page_config(page_title="Care Companion Chat", page_icon="💬")
st.title("💬 Care Companion Chatbot")

# LangGraph API configuration
LANGGRAPH_URL = "http://localhost:2024"
ASSISTANT_ID = "agent"

# Initialize chat history in session state
if "messages" not in st.session_state:
    st.session_state.messages = []

if "thread_id" not in st.session_state:
    st.session_state.thread_id = None

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Chat input
if prompt := st.chat_input("Type your message here..."):
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})
    
    # Display user message
    with st.chat_message("user"):
        st.markdown(prompt)
    
    # Display assistant response
    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        full_response = ""
        
        try:
            # Prepare the request payload
            payload = {
                "assistant_id": ASSISTANT_ID,
                "input": {
                    "messages": [
                        {"role": "human", "content": prompt}
                    ]
                },
                "stream_mode": "updates"
            }
            
            # If we have a thread_id, use it for conversation continuity
            if st.session_state.thread_id:
                url = f"{LANGGRAPH_URL}/threads/{st.session_state.thread_id}/runs/stream"
            else:
                url = f"{LANGGRAPH_URL}/runs/stream"
            
            # Make streaming request to LangGraph API
            with requests.post(url, json=payload, stream=True, timeout=60) as response:
                response.raise_for_status()
                
                for line in response.iter_lines(decode_unicode=True):
                    if not line:
                        continue
                    
                    # Parse SSE format (lines start with "data: ")
                    if line.startswith('data: '):
                        try:
                            data = json.loads(line[6:])  # Remove 'data: ' prefix
                            
                            # Store thread_id if present in metadata
                            if 'thread_id' in data:
                                st.session_state.thread_id = data['thread_id']
                            
                            # Extract AI message from updates
                            # Updates format: node name as key, with messages inside
                            if isinstance(data, dict):
                                for node_name, node_data in data.items():
                                    if isinstance(node_data, dict) and 'messages' in node_data:
                                        messages = node_data['messages']
                                        if isinstance(messages, list):
                                            for msg in messages:
                                                # Check if this is an AI message
                                                if isinstance(msg, dict):
                                                    msg_type = msg.get('type', '')
                                                    content = msg.get('content', '')
                                                    
                                                    # Only display AI messages
                                                    if 'ai' in msg_type.lower() and content:
                                                        full_response = content
                                                        message_placeholder.markdown(full_response + "▌")
                                    
                        except json.JSONDecodeError as e:
                            st.write(f"Debug - Parse error: {e}")
                            st.write(f"Debug - Line: {line}")
                            continue
                        except Exception as e:
                            st.write(f"Debug - Processing error: {e}")
                            st.write(f"Debug - Data: {data}")
                            continue
            
            # Display final message without cursor
            if full_response:
                message_placeholder.markdown(full_response)
                st.session_state.messages.append({"role": "assistant", "content": full_response})
            else:
                error_msg = "No response received from the agent."
                message_placeholder.error(error_msg)
                st.session_state.messages.append({"role": "assistant", "content": error_msg})
            
        except requests.exceptions.ConnectionError:
            st.error("❌ Cannot connect to LangGraph API")
            st.info("Make sure your LangGraph server is running with `langgraph dev`")
        except requests.exceptions.Timeout:
            st.error("⏱️ Request timed out")
        except requests.exceptions.RequestException as e:
            st.error(f"Error: {str(e)}")
        except Exception as e:
            st.error(f"An unexpected error occurred: {str(e)}")

# Sidebar with info
with st.sidebar:
    st.header("About")
    st.write("This is a compassionate AI care companion chatbot.")
    
    st.header("Connection")
    st.code(f"{LANGGRAPH_URL}", language="text")
    
    st.header("Status")
    if st.session_state.thread_id:
        st.success("✅ Conversation Active")
        st.caption(f"Thread: {st.session_state.thread_id[:12]}...")
    else:
        st.info("💬 Send a message to start")
    
    # Clear chat button
    if st.button("🗑️ Clear Chat History"):
        st.session_state.messages = []
        st.session_state.thread_id = None
        st.rerun()
    
    # Debug toggle
    if st.checkbox("Show Debug Info"):
        st.json({
            "messages_count": len(st.session_state.messages),
            "thread_id": st.session_state.thread_id,
            "assistant_id": ASSISTANT_ID
        })

import streamlit as st
import requests
import json
import os
import time
from pathlib import Path

# Configure the page
st.set_page_config(page_title="Care Companion Chat", page_icon="💬", layout="wide")

# Configuration
LANGGRAPH_URL = "http://localhost:2024"
ASSISTANT_ID = "agent"
IMAGE_API_URL = "http://localhost:8000"
STATE_FILE = "image_state.json"
IMAGE_DIR = "src/images"

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []

if "thread_id" not in st.session_state:
    st.session_state.thread_id = None

if "current_image" not in st.session_state:
    st.session_state.current_image = None

if "image_caption" not in st.session_state:
    st.session_state.image_caption = ""

if "last_check_time" not in st.session_state:
    st.session_state.last_check_time = 0


# Function to check for image updates from state file
def check_image_state():
    """Check if there's a new image to display."""
    try:
        if os.path.exists(STATE_FILE):
            file_mtime = os.path.getmtime(STATE_FILE)
            
            # Only update if file has changed
            if file_mtime > st.session_state.last_check_time:
                with open(STATE_FILE, 'r') as f:
                    state = json.load(f)
                
                image_name = state.get("image_name")
                if image_name:
                    image_path = os.path.join(IMAGE_DIR, image_name)
                    if os.path.exists(image_path):
                        st.session_state.current_image = image_path
                        st.session_state.image_caption = state.get("caption", "")
                        st.session_state.last_check_time = file_mtime
                        return True
    except Exception as e:
        st.sidebar.error(f"Error checking image state: {e}")
    
    return False


# Create two-column layout
col1, col2 = st.columns([2, 1])

# LEFT COLUMN - Chat Interface
with col1:
    st.title("💬 Care Companion Chatbot")
    
    # Display chat history
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
    
    # Chat input
    if prompt := st.chat_input("Type your message here..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        
        with st.chat_message("user"):
            st.markdown(prompt)
        
        with st.chat_message("assistant"):
            message_placeholder = st.empty()
            full_response = ""
            
            try:
                payload = {
                    "assistant_id": ASSISTANT_ID,
                    "input": {
                        "messages": [
                            {"role": "human", "content": prompt}
                        ]
                    },
                    "stream_mode": "updates"
                }
                
                if st.session_state.thread_id:
                    url = f"{LANGGRAPH_URL}/threads/{st.session_state.thread_id}/runs/stream"
                else:
                    url = f"{LANGGRAPH_URL}/runs/stream"
                
                with requests.post(url, json=payload, stream=True, timeout=60) as response:
                    response.raise_for_status()
                    
                    for line in response.iter_lines(decode_unicode=True):
                        if not line:
                            continue
                        
                        if line.startswith('data: '):
                            try:
                                data = json.loads(line[6:])
                                
                                if 'thread_id' in data:
                                    st.session_state.thread_id = data['thread_id']
                                
                                if isinstance(data, dict):
                                    for node_name, node_data in data.items():
                                        if isinstance(node_data, dict) and 'messages' in node_data:
                                            messages = node_data['messages']
                                            if isinstance(messages, list):
                                                for msg in messages:
                                                    if isinstance(msg, dict):
                                                        msg_type = msg.get('type', '')
                                                        content = msg.get('content', '')
                                                        
                                                        if 'ai' in msg_type.lower() and content:
                                                            full_response = content
                                                            message_placeholder.markdown(full_response + "▌")
                                            
                            except json.JSONDecodeError:
                                continue
                            except Exception:
                                continue
                
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


# RIGHT COLUMN - Image Display
with col2:
    st.header("📸 Visual Context")
    
    # Check for image updates
    if check_image_state():
        st.rerun()
    
    # Display current image
    if st.session_state.current_image:
        try:
            st.image(
                st.session_state.current_image, 
                caption=st.session_state.image_caption,
                use_container_width=True
            )
            
            # Show image info
            image_name = os.path.basename(st.session_state.current_image)
            st.caption(f"📁 {image_name}")
            
            if st.session_state.image_caption:
                st.info(st.session_state.image_caption)
                
        except Exception as e:
            st.error(f"Error displaying image: {e}")
    else:
        st.info("No image to display")
        st.caption("Waiting for API call...")
    
    # Manual refresh button
    if st.button("🔄 Check for Updates"):
        if check_image_state():
            st.success("Image updated!")
            st.rerun()
        else:
            st.info("No new image")
    
    # Clear image button
    if st.button("🗑️ Clear Image"):
        st.session_state.current_image = None
        st.session_state.image_caption = ""
        if os.path.exists(STATE_FILE):
            os.remove(STATE_FILE)
        st.rerun()


# Sidebar
with st.sidebar:
    st.header("About")
    st.write("Care companion chatbot with API-controlled image display.")
    
    st.header("API Status")
    try:
        response = requests.get(f"{IMAGE_API_URL}/", timeout=2)
        if response.status_code == 200:
            st.success("✅ API Connected")
            st.code(IMAGE_API_URL, language="text")
        else:
            st.warning("⚠️ API Responded with error")
    except:
        st.error("❌ API Not Running")
        st.caption("Start with: `python image_api.py`")
    
    st.header("LangGraph Status")
    if st.session_state.thread_id:
        st.success("✅ Conversation Active")
        st.caption(f"Thread: {st.session_state.thread_id[:12]}...")
    else:
        st.info("💬 Send a message to start")
    
    if st.button("🗑️ Clear Chat History"):
        st.session_state.messages = []
        st.session_state.thread_id = None
        st.rerun()
    
    # Auto-refresh toggle
    st.header("Auto-Refresh")
    auto_refresh = st.checkbox("Enable (5s interval)", value=False)
    if auto_refresh:
        st.caption("🔄 Checking for updates...")
        time.sleep(5)
        st.rerun()
    
    # API Usage Guide
    with st.expander("📖 API Usage"):
        st.markdown(f"""
        ### Set Image
        ```
        curl -X POST "{IMAGE_API_URL}/set_image" \\
             -H "Content-Type: application/json" \\
             -d '{{"image_name": "example.png", "caption": "Description"}}'
        ```
        
        ### Python Example
        ```
        import requests
        
        response = requests.post(
            "{IMAGE_API_URL}/set_image",
            json={{
                "image_name": "scan.png",
                "caption": "Patient scan results"
            }}
        )
        print(response.json())
        ```
        
        ### List Available Images
        ```
        curl "{IMAGE_API_URL}/list_images"
        ```
        
        ### Clear Image
        ```
        curl -X DELETE "{IMAGE_API_URL}/clear_image"
        ```
        """)
    
    # Debug info
    if st.checkbox("Show Debug Info"):
        st.json({
            "messages_count": len(st.session_state.messages),
            "thread_id": st.session_state.thread_id,
            "current_image": st.session_state.current_image,
            "image_caption": st.session_state.image_caption,
            "last_check": st.session_state.last_check_time
        })

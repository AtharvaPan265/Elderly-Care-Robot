#!/bin/bash

# 1. LLM Session
# Commands: cd llm -> source venv -> langgraph dev
tmux new-session -d -s llm
tmux send-keys -t llm "cd llm" C-m
tmux send-keys -t llm "source .venv/bin/activate" C-m
tmux send-keys -t llm "langgraph dev" C-m
echo "Started session: llm"

# 2. Vision Session
# Commands: cd vision -> source .venv -> uvicorn
tmux new-session -d -s vision
tmux send-keys -t vision "cd vision" C-m
tmux send-keys -t vision "source .venv/bin/activate" C-m
tmux send-keys -t vision "uvicorn api:app --reload --host 0.0.0.0 --port 8000" C-m
echo "Started session: vision"

# 3. Audio Session
# Commands: cd audio -> source .venv -> uvicorn transcribe
tmux new-session -d -s audio
tmux send-keys -t audio "cd audio" C-m
tmux send-keys -t audio "source .venv/bin/activate" C-m
tmux send-keys -t audio "uvicorn transcribe_server:app --port 8001 --reload" C-m
echo "Started session: audio"

# 4. UI Session
# Commands: cd ui -> npm run dev
tmux new-session -d -s ui
tmux send-keys -t ui "cd ui" C-m
tmux send-keys -t ui "npm run dev" C-m
echo "Started session: ui"

echo "------------------------------------------------"
echo "All sessions initialized."
echo "Use 'tmux attach -t [session_name]' to view logs."
tmux list-sessions


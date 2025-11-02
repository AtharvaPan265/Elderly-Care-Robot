import os
import pandas as pd

# ======== Define dataset root ========
root = "/Users/avnipatel/Downloads/HRI-SENSE"

# Define subfolders
sensory_root = os.path.join(root, "sensory-data")
questionnaire_root = os.path.join(root, "questionnaire-data")
interaction_root = os.path.join(root, "interaction-event-labels")

# ======== Gather session identifiers ========
sessions = set()

# Each CSV filename is like: P01-M1-1.csv
for folder in ["user-face-data", "user-pose-data", "robot-joint-data", "dialogue-transcript"]:
    path = os.path.join(sensory_root, folder)
    if not os.path.exists(path):
        print(f"⚠️ Missing folder: {path}")
        continue
    for f in os.listdir(path):
        if f.endswith(".csv"):
            parts = f.split("-")
            participant = parts[0]  # e.g. P01
            model = parts[1]        # e.g. M1
            trial = parts[2].split(".")[0]
            sessions.add((participant, model, trial))

sessions = sorted(list(sessions))

# ======== Initialize completeness table ========
modalities = ["user_face", "body_pose", "robot_joint", "dialogue", "depth", "interaction_labels"]
df = pd.DataFrame(sessions, columns=["participant", "model", "trial"])
for m in modalities:
    df[m] = False

# ======== Check which files exist ========
for idx, row in df.iterrows():
    p, m, t = row["participant"], row["model"], row["trial"]

    # User face
    df.at[idx, "user_face"] = os.path.exists(f"{sensory_root}/user-face-data/{p}-{m}-{t}.csv")

    # Body pose (camera 0)
    df.at[idx, "body_pose"] = os.path.exists(f"{sensory_root}/user-pose-data/{p}-{m}-{t}-0.csv")

    # Robot joints
    df.at[idx, "robot_joint"] = os.path.exists(f"{sensory_root}/robot-joint-data/{p}-{m}-{t}.csv")

    # Dialogue
    df.at[idx, "dialogue"] = os.path.exists(f"{sensory_root}/dialogue-transcript/{p}-{m}-{t}.csv")

    # Depth video
    df.at[idx, "depth"] = os.path.exists(f"{sensory_root}/depth-data/{p}-{m}-{t}.mp4")

    # Interaction labels
    df.at[idx, "interaction_labels"] = os.path.exists(f"{interaction_root}/{p}-{m}-{t}.csv")

# ======== Save results ========
output_path = os.path.join(root, "HRI-SENSE_session_completeness.csv")
df.to_csv(output_path, index=False)
print(f"\n✅ Completeness table saved to: {output_path}")
print(f"Total sessions found: {len(df)}")
print(df.head())

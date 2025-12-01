import os
import shutil
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel

app = FastAPI()

# Allow CORS (helpful if you ever want to test directly from browser)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
# Use "cuda" for NVIDIA GPU (requires cuDNN), or "cpu" for CPU only.
# "large-v3-turbo" is highly recommended for speed/accuracy.
DEVICE = "cpu"  # Change to "cuda" if you have a compatible GPU
COMPUTE_TYPE = "int8" # Change to "int8" if using CPU to save memory

print(f"Loading Whisper model ({DEVICE})...")
model = WhisperModel("small", device=DEVICE, compute_type=COMPUTE_TYPE)
print("Model loaded successfully.")

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    # Create a temp filename to save the uploaded audio
    temp_filename = f"temp_{file.filename}"
    
    try:
        # 1. Save the uploaded file to disk
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 2. Transcribe
        # beam_size=5 provides better accuracy
        segments, info = model.transcribe(temp_filename, beam_size=5)
        
        # 3. Combine segments into a single string
        transcribed_text = " ".join([segment.text for segment in segments]).strip()
        
        print(f"Transcribed: {transcribed_text[:50]}...") # Log first 50 chars
        return {"text": transcribed_text}

    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": str(e)}
        
    finally:
        # 4. Cleanup: Always delete the temp file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import os
from pathlib import Path
import uvicorn

app = FastAPI(title="Image Display API")

# Configuration
STATE_FILE = "image_state.json"
IMAGE_DIR = "src/images"

class ImageRequest(BaseModel):
    image_name: str
    caption: str = ""

class ImageResponse(BaseModel):
    status: str
    image_name: str
    caption: str
    full_path: str

@app.get("/")
async def root():
    return {"message": "Image Display API is running", "endpoint": "/set_image"}

@app.post("/set_image", response_model=ImageResponse)
async def set_image(request: ImageRequest):
    """
    Set the image to be displayed in the Streamlit UI.
    
    Example usage:
    curl -X POST "http://localhost:8000/set_image" \
         -H "Content-Type: application/json" \
         -d '{"image_name": "example.png", "caption": "My Image"}'
    """
    # Verify image exists
    image_path = os.path.join(IMAGE_DIR, request.image_name)
    
    if not os.path.exists(image_path):
        raise HTTPException(
            status_code=404, 
            detail=f"Image '{request.image_name}' not found in {IMAGE_DIR} directory"
        )
    
    # Update state file
    state = {
        "image_name": request.image_name,
        "caption": request.caption,
        "full_path": image_path,
        "timestamp": str(os.path.getmtime(STATE_FILE)) if os.path.exists(STATE_FILE) else "0"
    }
    
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)
    
    return ImageResponse(
        status="success",
        image_name=request.image_name,
        caption=request.caption,
        full_path=image_path
    )

@app.get("/current_image")
async def get_current_image():
    """Get the currently displayed image info."""
    if not os.path.exists(STATE_FILE):
        return {"status": "no_image", "image_name": None}
    
    with open(STATE_FILE, 'r') as f:
        state = json.load(f)
    
    return state

@app.delete("/clear_image")
async def clear_image():
    """Clear the currently displayed image."""
    if os.path.exists(STATE_FILE):
        os.remove(STATE_FILE)
    return {"status": "cleared"}

@app.get("/list_images")
async def list_images():
    """List all available images in the directory."""
    if not os.path.exists(IMAGE_DIR):
        return {"images": []}
    
    images = [f for f in os.listdir(IMAGE_DIR) 
              if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'))]
    
    return {"images": images, "count": len(images)}

if __name__ == "__main__":
    # Create images directory if it doesn't exist
    os.makedirs(IMAGE_DIR, exist_ok=True)
    
    print("🚀 Starting Image Display API Server...")
    print("📁 Image directory:", os.path.abspath(IMAGE_DIR))
    print("📋 API docs available at: http://localhost:8000/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)

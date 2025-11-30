from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import cv2
from approachability_detector import ApproachabilityDetector

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
detector = None
cap = None
is_running = False

@app.post("/start")
def start_detection():
    """Initialize camera and detector"""
    global detector, cap, is_running
    
    if is_running:
        return {"status": "already_running"}
    
    detector = ApproachabilityDetector()
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        return {"status": "error", "message": "Could not open camera"}
    
    is_running = True
    return {"status": "started"}

@app.get("/state")
def get_state():
    """Get current approachability state"""
    global detector, cap, is_running
    
    if not is_running or cap is None:
        return {"status": "not_running", "approachable": False}
    
    ret, frame = cap.read()
    if not ret:
        return {"status": "error", "message": "Could not read frame"}
    
    result = detector.process_frame(frame)
    
    # Convert numpy types to native Python
    result["approachable"] = bool(result["approachable"])
    result["score"] = float(result["score"])
    result["status"] = "running"
    
    return result

@app.post("/stop")
def stop_detection():
    """Stop camera and reset detector"""
    global detector, cap, is_running
    
    if not is_running:
        return {"status": "not_running"}
    
    if cap is not None:
        cap.release()
        cap = None
    
    detector = None
    is_running = False
    
    return {"status": "stopped"}

@app.get("/health")
def health_check():
    """Check API health"""
    return {"status": "healthy", "running": is_running}

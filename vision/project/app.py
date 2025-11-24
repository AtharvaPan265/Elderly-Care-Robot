from fastapi import FastAPI
from fastapi.responses import JSONResponse
import threading
from detector import ApproachabilityDetector
import uvicorn

app = FastAPI(title="Approachability API")

detector = ApproachabilityDetector()
detector_thread = None


@app.post("/start")
def start_detector():
    global detector_thread

    if detector.running:
        return JSONResponse({"message": "Detector already running"}, status_code=400)

    def run():
        detector.run()

    detector_thread = threading.Thread(target=run, daemon=True)
    detector_thread.start()

    return {"message": "Detector started"}


@app.post("/stop")
def stop_detector():
    if not detector.running:
        return JSONResponse({"message": "Detector not running"}, status_code=400)

    detector.stop()
    return {"message": "Detector stopped"}


@app.get("/status")
def get_status():
    return detector.current_status


@app.get("/")
def root():
    return {"message": "Approachability API running"}


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

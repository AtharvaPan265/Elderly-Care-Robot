# Quick Start Guide

## Getting Started in 3 Steps

### Step 1: Activate Virtual Environment
```bash
source venv/bin/activate
```

### Step 2: Test Setup (Optional but Recommended)
```bash
python test_setup.py
```
This will verify:
- All packages are installed correctly
- Camera can be accessed
- MediaPipe is working

### Step 3: Run Gesture Recognition
```bash
python gesture_recognition.py
```

## Gesture Cheat Sheet

| Gesture | Command | Use Case |
|---------|---------|----------|
| 👍 Thumbs Up | Yes/Come/Understood | Confirm action, call robot |
| 👎 Thumbs Down | No/Don't approach | Reject action, stay away |
| ✋ Open Palm | Stop/Wait | Halt movement |
| ✌️ Peace Sign | Two/Confirmed | Second option |
| ✊ Fist | Hold position | Stay in place |
| 👌 OK Sign | All good | Everything OK |

## Tips for Best Results

1. **Lighting**: Ensure good lighting on your hand
2. **Background**: Plain backgrounds work best
3. **Distance**: Keep hand 1-3 feet from camera
4. **Steady**: Hold gestures for 1-2 seconds
5. **Clear View**: Keep entire hand visible

## Troubleshooting

**Camera permission denied?**
- Go to System Preferences > Security & Privacy > Camera
- Enable camera access for Terminal or your Python IDE

**Gestures not detected?**
- Check lighting
- Make gestures more deliberate
- Ensure hand is fully visible

**Program won't start?**
- Make sure virtual environment is activated
- Run `test_setup.py` to diagnose issues

## Exit
Press `q` to quit the application

---

For more detailed information, see README.md


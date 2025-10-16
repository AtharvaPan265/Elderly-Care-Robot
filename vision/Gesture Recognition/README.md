# SCR Robot - Hand Gesture Recognition System

A real-time hand gesture recognition system for robot control using computer vision and machine learning.

## Features

- Real-time hand tracking using MediaPipe
- Recognition of 6 simple hand gestures
- Works with Mac's built-in camera
- Visual feedback with hand landmark overlay
- Simple and intuitive gesture-based robot commands

## Supported Gestures

1. **THUMBS UP** 👍 - Yes/Come here/I understand
2. **THUMBS DOWN** 👎 - No/Don't approach/I don't understand
3. **OPEN PALM** ✋ - Stop/Wait
4. **PEACE SIGN** ✌️ - Two/Confirmed
5. **FIST** ✊ - Stop/Hold position
6. **OK SIGN** 👌 - Okay/All good

## Installation

### 1. Create Virtual Environment

The virtual environment has already been created. To activate it:

```bash
source venv/bin/activate
```

### 2. Install Dependencies

Dependencies are already installed, but if you need to reinstall:

```bash
pip install -r requirements.txt
```

## Usage

### Run the Gesture Recognition System

1. Activate the virtual environment (if not already activated):
   ```bash
   source venv/bin/activate
   ```

2. Run the gesture recognition script:
   ```bash
   python gesture_recognition.py
   ```

3. The camera window will open and start detecting hand gestures

4. Perform gestures in front of the camera to test recognition

5. Press 'q' to quit the application

### Camera Permission

The first time you run the script, macOS will ask for camera permission. Click "Allow" to grant access.

## Technical Details

### Libraries Used

- **OpenCV (opencv-python)**: Camera access and video processing
- **MediaPipe**: Google's hand tracking and landmark detection
- **NumPy**: Numerical operations for gesture calculations

### How It Works

1. **Hand Detection**: MediaPipe detects hands in the video frame and identifies 21 landmark points on each hand
2. **Landmark Analysis**: The system analyzes which fingers are extended based on landmark positions
3. **Gesture Recognition**: Pattern matching logic determines which gesture is being performed
4. **Visual Feedback**: The recognized gesture is displayed on screen with hand landmarks overlaid

### Gesture Detection Logic

The system uses the following approach:
- Tracks 21 hand landmarks (finger tips, joints, palm, wrist)
- Determines which fingers are extended vs. curled
- Calculates distances between specific points (e.g., for OK sign)
- Matches patterns to predefined gestures

## Customization

You can customize the gesture recognition by modifying `gesture_recognition.py`:

- Adjust detection confidence thresholds in the `GestureRecognizer.__init__()` method
- Add new gestures by extending the `recognize_gesture()` method
- Modify gesture meanings in the return strings
- Change visual display parameters (colors, text size, etc.)

## Troubleshooting

### Camera Not Opening
- Ensure no other application is using the camera
- Check System Preferences > Security & Privacy > Camera permissions
- Try restarting the terminal/IDE

### Low Detection Accuracy
- Ensure good lighting conditions
- Keep hand clearly visible in frame
- Adjust `min_detection_confidence` and `min_tracking_confidence` parameters
- Try performing gestures more deliberately

### Performance Issues
- Close other resource-intensive applications
- Reduce camera resolution if needed
- Ensure sufficient lighting (poor lighting requires more processing)

## Future Enhancements

Potential improvements for the system:
- [ ] Integration with actual robot hardware
- [ ] Gesture sequence recognition (multiple gestures in sequence)
- [ ] Distance estimation for spatial commands
- [ ] Two-hand gesture support
- [ ] Custom gesture training interface
- [ ] Gesture history and logging
- [ ] Remote control via network

## Dependencies

See `requirements.txt` for specific versions:
- opencv-python==4.8.1.78
- mediapipe==0.10.8
- numpy==1.24.3

## License

This project is for educational and personal use.

## Credits

- Hand tracking powered by Google's MediaPipe
- Computer vision processing with OpenCV


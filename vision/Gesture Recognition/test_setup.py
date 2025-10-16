"""
Test script to verify the installation and camera access
Run this to ensure everything is set up correctly before using gesture recognition
"""

import sys

def test_imports():
    """Test if all required packages can be imported"""
    print("Testing package imports...")
    
    try:
        import cv2
        print("✓ OpenCV imported successfully (version: {})".format(cv2.__version__))
    except ImportError as e:
        print("✗ OpenCV import failed:", e)
        return False
    
    try:
        import mediapipe as mp
        print("✓ MediaPipe imported successfully (version: {})".format(mp.__version__))
    except ImportError as e:
        print("✗ MediaPipe import failed:", e)
        return False
    
    try:
        import numpy as np
        print("✓ NumPy imported successfully (version: {})".format(np.__version__))
    except ImportError as e:
        print("✗ NumPy import failed:", e)
        return False
    
    return True

def test_camera():
    """Test if camera can be accessed"""
    print("\nTesting camera access...")
    
    try:
        import cv2
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("✗ Could not open camera")
            print("  Make sure:")
            print("  - No other application is using the camera")
            print("  - Camera permissions are granted in System Preferences")
            return False
        
        # Try to read a frame
        ret, frame = cap.read()
        if not ret:
            print("✗ Could not read frame from camera")
            cap.release()
            return False
        
        print("✓ Camera access successful")
        print("  Resolution: {}x{}".format(frame.shape[1], frame.shape[0]))
        
        cap.release()
        return True
    
    except Exception as e:
        print("✗ Camera test failed:", e)
        return False

def test_mediapipe():
    """Test if MediaPipe hand detection works"""
    print("\nTesting MediaPipe hand detection...")
    
    try:
        import mediapipe as mp
        
        mp_hands = mp.solutions.hands
        hands = mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7
        )
        
        print("✓ MediaPipe hand detection initialized successfully")
        hands.close()
        return True
    
    except Exception as e:
        print("✗ MediaPipe test failed:", e)
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("SCR Robot - Setup Verification Test")
    print("=" * 60)
    print()
    
    all_passed = True
    
    # Test imports
    if not test_imports():
        all_passed = False
    
    # Test camera
    if not test_camera():
        all_passed = False
    
    # Test MediaPipe
    if not test_mediapipe():
        all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✓ ALL TESTS PASSED!")
        print("You're ready to run gesture_recognition.py")
    else:
        print("✗ Some tests failed. Please fix the issues above.")
        sys.exit(1)
    print("=" * 60)

if __name__ == "__main__":
    main()


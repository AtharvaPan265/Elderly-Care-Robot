"""
Hand Gesture Recognition for Robot Control
Uses MediaPipe for hand tracking and OpenCV for camera access
"""

import cv2
import mediapipe as mp
import numpy as np
import math

class GestureRecognizer:
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.mp_drawing = mp.solutions.drawing_utils
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        )
        
    def calculate_distance(self, point1, point2):
        """Calculate Euclidean distance between two points"""
        return math.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)
    
    def is_finger_extended(self, landmarks, finger_tip_id, finger_pip_id):
        """Check if a finger is extended based on landmark positions"""
        tip = landmarks[finger_tip_id]
        pip = landmarks[finger_pip_id]
        
        # For thumb, check x-axis distance (different orientation)
        if finger_tip_id == 4:
            return tip.x < landmarks[3].x - 0.05
        
        # For other fingers, check y-axis (tip should be above PIP joint)
        return tip.y < pip.y
    
    def recognize_gesture(self, hand_landmarks):
        """
        Recognize hand gestures based on finger positions
        Returns: gesture name as string
        """
        if not hand_landmarks:
            return "No hand detected"
        
        landmarks = hand_landmarks.landmark
        
        # Check which fingers are extended
        # Finger tip IDs: Thumb=4, Index=8, Middle=12, Ring=16, Pinky=20
        # Finger PIP IDs: Thumb=3, Index=6, Middle=10, Ring=14, Pinky=18
        index_extended = self.is_finger_extended(landmarks, 8, 6)
        middle_extended = self.is_finger_extended(landmarks, 12, 10)
        ring_extended = self.is_finger_extended(landmarks, 16, 14)
        pinky_extended = self.is_finger_extended(landmarks, 20, 18)
        
        # Count non-thumb fingers
        num_fingers_extended = sum([index_extended, middle_extended, ring_extended, pinky_extended])
        
        # Gesture Recognition Logic
        
        # 1. THUMBS UP - Thumb pointing up, other fingers curled
        # Check if other fingers are NOT extended and thumb is above wrist
        if not index_extended and not middle_extended and not ring_extended and not pinky_extended:
            thumb_tip = landmarks[4]
            thumb_ip = landmarks[3]
            wrist = landmarks[0]
            index_mcp = landmarks[5]  # Base of index finger
            
            # Thumb tip should be above thumb IP joint and above index finger base
            # and significantly above wrist
            if (thumb_tip.y < thumb_ip.y - 0.05 and 
                thumb_tip.y < wrist.y - 0.1 and
                thumb_tip.y < index_mcp.y):
                return "THUMBS UP - Yes/Come here/Understood"
        
        # 2. THUMBS DOWN - Thumb pointing down, other fingers curled
        # Check if other fingers are NOT extended and thumb is below wrist
        if not index_extended and not middle_extended and not ring_extended and not pinky_extended:
            thumb_tip = landmarks[4]
            thumb_ip = landmarks[3]
            wrist = landmarks[0]
            index_mcp = landmarks[5]  # Base of index finger
            
            # Thumb tip should be below thumb IP joint and below wrist
            if (thumb_tip.y > thumb_ip.y + 0.05 and 
                thumb_tip.y > wrist.y + 0.1 and
                thumb_tip.y > index_mcp.y):
                return "THUMBS DOWN - No/Don't approach"
        
        # 3. OPEN PALM (STOP) - All fingers extended
        if num_fingers_extended >= 4:  # Allow some tolerance
            return "STOP - Stop/Wait"
        
        # 4. PEACE SIGN (V) - Index and middle fingers extended
        if index_extended and middle_extended and not ring_extended and not pinky_extended:
            return "PEACE SIGN - Two/Confirmed"
        
        # 5. FIST - No fingers extended
        if num_fingers_extended == 0:
            return "FIST - Stop/Hold position"
        
        # 6. OK SIGN - Thumb and index form circle, other fingers extended
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        distance = self.calculate_distance(
            (thumb_tip.x, thumb_tip.y),
            (index_tip.x, index_tip.y)
        )
        if distance < 0.05 and middle_extended and ring_extended:
            return "OK SIGN - Okay/All good"
        
        return "Unknown gesture"
    
    def process_frame(self, frame):
        """Process a video frame and return annotated frame with gesture"""
        # Flip the frame horizontally for a mirror view
        frame = cv2.flip(frame, 1)
        
        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process the frame with MediaPipe
        results = self.hands.process(rgb_frame)
        
        gesture = "No hand detected"
        
        # Draw hand landmarks and recognize gesture
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # Draw landmarks on the frame
                self.mp_drawing.draw_landmarks(
                    frame,
                    hand_landmarks,
                    self.mp_hands.HAND_CONNECTIONS,
                    self.mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
                    self.mp_drawing.DrawingSpec(color=(255, 0, 0), thickness=2)
                )
                
                # Recognize gesture
                gesture = self.recognize_gesture(hand_landmarks)
        
        # Display gesture text on frame
        cv2.putText(frame, gesture, (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 
                    1, (0, 255, 0), 2, cv2.LINE_AA)
        
        return frame, gesture
    
    def release(self):
        """Release resources"""
        self.hands.close()


def main():
    """Main function to run the gesture recognition system"""
    print("Starting Hand Gesture Recognition System...")
    print("Press 'q' to quit")
    print("\nSupported Gestures:")
    print("  1. THUMBS UP - Yes/Come here/Understood")
    print("  2. THUMBS DOWN - No/Don't approach")
    print("  3. OPEN PALM - Stop/Wait")
    print("  4. PEACE SIGN - Two/Confirmed")
    print("  5. FIST - Stop/Hold position")
    print("  6. OK SIGN - Okay/All good")
    print("\n")
    
    # Initialize camera
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open camera")
        return
    
    # Initialize gesture recognizer
    recognizer = GestureRecognizer()
    
    try:
        while True:
            # Read frame from camera
            ret, frame = cap.read()
            
            if not ret:
                print("Error: Could not read frame")
                break
            
            # Process frame and get gesture
            annotated_frame, gesture = recognizer.process_frame(frame)
            
            # Display the frame
            cv2.imshow('Hand Gesture Recognition - Press Q to quit', annotated_frame)
            
            # Break loop on 'q' key press
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    
    finally:
        # Cleanup
        cap.release()
        cv2.destroyAllWindows()
        recognizer.release()
        print("System shutdown complete")


if __name__ == "__main__":
    main()


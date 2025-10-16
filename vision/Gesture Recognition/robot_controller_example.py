"""
Example Robot Controller Integration
This demonstrates how to use gesture recognition to control a robot

This is a template - you'll need to replace the robot control functions
with actual commands for your specific robot hardware/API
"""

import cv2
from gesture_recognition import GestureRecognizer
import time

class RobotController:
    """
    Template robot controller class
    Replace these methods with actual robot control code
    """
    
    def __init__(self):
        self.robot_state = "idle"
        self.last_command_time = 0
        self.command_cooldown = 2.0  # seconds between commands
        
    def can_execute_command(self):
        """Prevent too frequent command execution"""
        current_time = time.time()
        if current_time - self.last_command_time > self.command_cooldown:
            self.last_command_time = current_time
            return True
        return False
    
    def approach_user(self):
        """Command robot to approach the user"""
        print("🤖 ROBOT: Approaching user...")
        # TODO: Add your robot's movement code here
        # Example: robot.move_forward(speed=0.5, distance=1.0)
        self.robot_state = "approaching"
    
    def stop_movement(self):
        """Command robot to stop"""
        print("🤖 ROBOT: Stopping...")
        # TODO: Add your robot's stop code here
        # Example: robot.stop()
        self.robot_state = "stopped"
    
    def retreat(self):
        """Command robot to move back"""
        print("🤖 ROBOT: Moving back...")
        # TODO: Add your robot's reverse movement code here
        # Example: robot.move_backward(speed=0.5, distance=1.0)
        self.robot_state = "retreating"
    
    def hold_position(self):
        """Command robot to hold current position"""
        print("🤖 ROBOT: Holding position...")
        # TODO: Add your robot's position hold code here
        # Example: robot.lock_position()
        self.robot_state = "holding"
    
    def acknowledge(self):
        """Robot acknowledges understanding"""
        print("🤖 ROBOT: Acknowledged!")
        # TODO: Add robot's acknowledgment behavior
        # Example: robot.play_sound("acknowledged.wav") or robot.flash_led()
    
    def turn_left(self):
        """Command robot to turn left"""
        print("🤖 ROBOT: Turning left...")
        # TODO: Add your robot's turn left code
        # Example: robot.rotate(-90)
        self.robot_state = "turning"
    
    def turn_right(self):
        """Command robot to turn right"""
        print("🤖 ROBOT: Turning right...")
        # TODO: Add your robot's turn right code
        # Example: robot.rotate(90)
        self.robot_state = "turning"
    
    def raise_alert(self):
        """Robot signals attention/question"""
        print("🤖 ROBOT: Alert received!")
        # TODO: Add robot's alert response
        # Example: robot.play_sound("alert.wav")

def process_gesture_command(gesture, robot):
    """
    Map recognized gestures to robot commands
    """
    
    # Extract the gesture type (before the dash)
    gesture_type = gesture.split(" - ")[0] if " - " in gesture else gesture
    
    # Map gestures to robot actions
    if "THUMBS UP" in gesture_type:
        robot.approach_user()
        
    elif "THUMBS DOWN" in gesture_type:
        robot.retreat()
        
    elif "STOP" in gesture_type or "OPEN PALM" in gesture_type:
        robot.stop_movement()
        
    elif "FIST" in gesture_type:
        robot.hold_position()
        
    elif "OK SIGN" in gesture_type:
        robot.acknowledge()
        
    elif "PEACE SIGN" in gesture_type:
        robot.acknowledge()

def main():
    """Main control loop"""
    print("=" * 60)
    print("SCR Robot - Gesture Control System")
    print("=" * 60)
    print("\nInitializing systems...")
    
    # Initialize camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open camera")
        return
    
    # Initialize gesture recognizer and robot controller
    recognizer = GestureRecognizer()
    robot = RobotController()
    
    print("✓ Camera initialized")
    print("✓ Gesture recognizer ready")
    print("✓ Robot controller ready")
    print("\nSystem ready! Waiting for gestures...")
    print("Press 'q' to quit\n")
    
    current_gesture = "No hand detected"
    previous_gesture = ""
    gesture_stable_count = 0
    required_stable_frames = 15  # Gesture must be stable for ~15 frames
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Error: Could not read frame")
                break
            
            # Process frame and recognize gesture
            annotated_frame, gesture = recognizer.process_frame(frame)
            
            # Gesture stability check (avoid false positives)
            if gesture == current_gesture:
                gesture_stable_count += 1
            else:
                current_gesture = gesture
                gesture_stable_count = 0
            
            # Execute command if gesture is stable and different from previous
            if (gesture_stable_count >= required_stable_frames and 
                current_gesture != previous_gesture and
                current_gesture != "No hand detected" and
                "Unknown" not in current_gesture and
                robot.can_execute_command()):
                
                print(f"\n{'='*60}")
                print(f"Gesture Detected: {current_gesture}")
                process_gesture_command(current_gesture, robot)
                print(f"Robot State: {robot.robot_state}")
                print(f"{'='*60}\n")
                
                previous_gesture = current_gesture
            
            # Add robot state to display
            status_text = f"Robot: {robot.robot_state.upper()}"
            cv2.putText(annotated_frame, status_text, (10, 90), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            
            # Display frame
            cv2.imshow('Robot Gesture Control - Press Q to quit', annotated_frame)
            
            # Check for quit command
            if cv2.waitKey(1) & 0xFF == ord('q'):
                print("\nShutting down...")
                robot.stop_movement()
                break
    
    finally:
        # Cleanup
        cap.release()
        cv2.destroyAllWindows()
        recognizer.release()
        print("System shutdown complete")

if __name__ == "__main__":
    main()


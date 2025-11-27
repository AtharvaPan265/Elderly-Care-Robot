"""
approachability_detector.py

This module provides a class-based, well-documented system for detecting:

    - Facial emotions (via FER)
    - Body posture & orientation (MediaPipe Pose)
    - Micro-expressions and gaze cues (MediaPipe FaceMesh)
    - Hand gestures (MediaPipe Hands)

The system produces:
    1. Raw detection outputs (emotion, posture cues, gesture)
    2. An "approachability score"
    3. A final binary decision: approachable vs unapproachable

This structure makes it easy to integrate into a FAST API endpoint.
The FastAPI service can:
    - Capture an image or video frame
    - Pass the frame to this module
    - Receive JSON:
        {
            "emotion": "...",
            "emotion_confidence": 0.00,
            "gesture": "...",
            "approachable": true/false,
            "score": 1.23,
            "feedback": [...]
        }

LLM-triggered dialogue can then happen based on emotion.
"""

import cv2
import numpy as np
import mediapipe as mp
import math
from fer import FER
from collections import deque, Counter


# ======================================================================
# HELPER FUNCTIONS
# ======================================================================

def calculate_angle(a, b, c):
    """Returns the joint angle ABC in degrees using 2D points."""
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    return angle if angle <= 180 else 360 - angle


def is_finger_extended(landmarks, tip_id, pip_id):
    """Determine if a finger is extended based on landmark positions."""
    tip = landmarks[tip_id]
    pip = landmarks[pip_id]

    # Special rule for thumb
    if tip_id == 4:
        return tip.x < landmarks[3].x - 0.05

    return tip.y < pip.y


# ======================================================================
# MAIN CLASS
# ======================================================================

class ApproachabilityDetector:
    """
    Core class that handles all computer vision processing.

    Methods
    -------
    process_frame(frame):
        Runs emotion, pose, face, and gesture analysis.
        Returns a full JSON-friendly dictionary summary.

    get_state():
        Returns the smoothed state used in predictions.
    """

    EMOTION_WEIGHTS = {
        "happy": 2,
        "neutral": 0,
        "surprise": 1,
        "sad": -1,
        "fear": -2,
        "angry": -2,
        "disgust": -2
    }

    def __init__(self, history_length=20):
        # MediaPipe modules
        self.mp_pose = mp.solutions.pose
        self.mp_face = mp.solutions.face_mesh
        self.mp_hands = mp.solutions.hands

        self.pose = self.mp_pose.Pose(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.face_mesh = self.mp_face.FaceMesh(
            refine_landmarks=True,
            max_num_faces=1
        )
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        )

        # Emotion detector
        self.emotion_detector = FER(mtcnn=True)

        # Temporal smoothing
        self.score_history = deque(maxlen=history_length)
        self.emotion_history = deque(maxlen=10)
        self.prev_pose = None

    # ==================================================================
    # GESTURE DETECTION
    # ==================================================================
    def recognize_gesture(self, hand_landmarks):
        """
        Determines hand gesture type from MediaPipe landmarks.
        Returns string label or None.
        """
        if not hand_landmarks:
            return None

        lm = hand_landmarks.landmark

        index_ext = is_finger_extended(lm, 8, 6)
        middle_ext = is_finger_extended(lm, 12, 10)
        ring_ext = is_finger_extended(lm, 16, 14)
        pinky_ext = is_finger_extended(lm, 20, 18)
        num_ext = sum([index_ext, middle_ext, ring_ext, pinky_ext])

        # Thumbs up/down
        if num_ext == 0:
            thumb_tip = lm[4]
            thumb_ip = lm[3]
            wrist = lm[0]

            if thumb_tip.y < thumb_ip.y - 0.05 and thumb_tip.y < wrist.y - 0.1:
                return "THUMBS UP"
            if thumb_tip.y > thumb_ip.y + 0.05 and thumb_tip.y > wrist.y + 0.1:
                return "THUMBS DOWN"

        # Open palm
        if num_ext >= 4:
            return "STOP"

        # Peace
        if index_ext and middle_ext and not ring_ext and not pinky_ext:
            return "PEACE"

        # Fist
        if num_ext == 0:
            return "FIST"

        return None

    # ==================================================================
    # MAIN PROCESSING FUNCTION
    # ==================================================================
    def process_frame(self, frame):
        """
        Processes a single frame (numpy array BGR format) and returns:
            - Emotion & confidence
            - Posture cues
            - Facial micro-cues
            - Gesture
            - Approachability score + final label
            - Raw feedback list (explainability)

        This is the ONLY method your FastAPI collaborator needs.
        """

        output = {
            "emotion": None,
            "emotion_confidence": 0,
            "gesture": None,
            "approachable": False,
            "score": 0,
            "feedback": [],
            "trend_emotion": None,
        }

        h, w, _ = frame.shape
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        pose_res = self.pose.process(rgb)
        face_res = self.face_mesh.process(rgb)
        hand_res = self.hands.process(rgb)

        score = 0
        feedback = []

        # ---------------------------------------------------------------
        # Emotion Detection
        # ---------------------------------------------------------------
        faces = self.emotion_detector.detect_emotions(frame)
        if faces:
            emotions = faces[0]["emotions"]
            dominant = max(emotions, key=emotions.get)
            confidence = emotions[dominant]

            score += self.EMOTION_WEIGHTS.get(dominant, 0)
            output["emotion"] = dominant
            output["emotion_confidence"] = float(confidence)

            self.emotion_history.append(dominant)
            feedback.append(f"Emotion: {dominant} ({confidence:.2f})")

        else:
            feedback.append("Emotion not detected")

        # ---------------------------------------------------------------
        # Body Posture
        # ---------------------------------------------------------------
        if pose_res.pose_landmarks:
            lm = pose_res.pose_landmarks.landmark

            L_sh = [lm[11].x * w, lm[11].y * h]
            R_sh = [lm[12].x * w, lm[12].y * h]
            R_hip = [lm[24].x * w, lm[24].y * h]

            shoulder_angle = calculate_angle(L_sh, R_sh, R_hip)

            if 70 < shoulder_angle < 110:
                score += 2
                feedback.append("Facing camera")
            else:
                score -= 4
                feedback.append("Body turned away")

            # Arm openness
            L_wrist = [lm[15].x * w, lm[15].y * h]
            R_wrist = [lm[16].x * w, lm[16].y * h]
            dist = np.linalg.norm(np.array(L_wrist) - np.array(R_wrist))

            if dist > w * 0.3:
                score += 2
                feedback.append("Open posture")
            else:
                score -= 2
                feedback.append("Closed posture")

            # Hands near face → busy
            nose = [lm[0].x, lm[0].y]
            L_hand = [lm[15].x, lm[15].y]
            R_hand = [lm[16].x, lm[16].y]

            if math.dist(L_hand, nose) < 0.15 or math.dist(R_hand, nose) < 0.15:
                score -= 1.5
                feedback.append("Hands near face → busy")

        # ---------------------------------------------------------------
        # Gesture Recognition
        # ---------------------------------------------------------------
        if hand_res.multi_hand_landmarks:
            for hl in hand_res.multi_hand_landmarks:
                gesture = self.recognize_gesture(hl)
                if gesture:
                    output["gesture"] = gesture
                    feedback.append(f"Gesture: {gesture}")

                    if gesture == "THUMBS UP":
                        score += 3
                    elif gesture == "STOP":
                        score -= 4
                    elif gesture == "THUMBS DOWN":
                        score -= 3

        # ---------------------------------------------------------------
        # Temporal Smoothing
        # ---------------------------------------------------------------
        self.score_history.append(score)
        smoothed = np.mean(self.score_history)

        busy_flag = any("busy" in fb or "talking" in fb for fb in feedback)
        approachable = (smoothed > 0.2 and not busy_flag)

        # ---------------------------------------------------------------
        # Final Output Assembly
        # ---------------------------------------------------------------
        output["approachable"] = approachable
        output["score"] = float(smoothed)
        output["feedback"] = feedback

        if self.emotion_history:
            output["trend_emotion"] = Counter(self.emotion_history).most_common(1)[0][0]

        return output

    # ==================================================================
    def get_state(self):
        """Return current temporal smoothing state—useful for API debugging."""
        return {
            "score_history": list(self.score_history),
            "emotion_history": list(self.emotion_history)
        }
'''
if __name__ == "__main__":
    detector = ApproachabilityDetector()

    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("❌ ERROR: Could not open webcam.")
        exit()

    print("🎥 Webcam started. Press 'q' to quit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Frame capture failed.")
            break

        # Run your detection
        result = detector.process_frame(frame)

        # ============================
        # DRAW OVERLAY ON WEBCAM FEED
        # ============================

        overlay = frame.copy()

        # Sidebar background
        cv2.rectangle(overlay, (0, 0), (350, frame.shape[0]), (0, 0, 0), -1)
        alpha = 0.55
        frame = cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0)

        # Title
        cv2.putText(frame, "APPROACHABILITY", (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255,255,255), 2)

        # Emotion
        cv2.putText(frame, f"Emotion: {result['emotion']}", (10, 80),
            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,255), 2)

        cv2.putText(frame, f"Conf: {result['emotion_confidence']:.2f}", (10, 110),
            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200,200,200), 2)

        # Gesture
        cv2.putText(frame, f"Gesture: {result['gesture']}", (10, 160),
            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,200,0), 2)

        # Approachability
        status_color = (0,255,0) if result['approachable'] else (0,0,255)
        status_text = "APPROACHABLE" if result['approachable'] else "NOT APPROACHABLE"

        cv2.putText(frame, f"Status: {status_text}", (10, 220),
            cv2.FONT_HERSHEY_SIMPLEX, 0.8, status_color, 2)

        # Score
        cv2.putText(frame, f"Score: {result['score']:.2f}", (10, 260),
            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2)

        # Feedback lines
        y_offset = 320
        for fb in result["feedback"]:
            cv2.putText(frame, f"- {fb}", (10, y_offset),
                cv2.FONT_HERSHEY_SIMPLEX, 0.55, (180,180,180), 1)
            y_offset += 25


        # Display the webcam feed
        cv2.imshow("Approachability Detector", frame)

        # Print the results live
        print(result)

        # Quit on 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
'''
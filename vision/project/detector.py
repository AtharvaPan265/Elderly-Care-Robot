import cv2
import mediapipe as mp
from fer import FER
import numpy as np
import math
from collections import deque, Counter

# ---------------------------------------
# GESTURE RECOGNIZER
# ---------------------------------------
class GestureRecognizer:
    def __init__(self):
        self.mp_hands = mp.solutions.hands

    def is_finger_extended(self, lm, tip, pip):
        return lm[tip].y < lm[pip].y  # finger tip above pip joint

    def recognize(self, hand_landmarks):
        if not hand_landmarks:
            return None

        lm = hand_landmarks.landmark

        idx = self.is_finger_extended(lm, 8, 6)
        mid = self.is_finger_extended(lm, 12, 10)
        ring = self.is_finger_extended(lm, 16, 14)
        pink = self.is_finger_extended(lm, 20, 18)

        extended = sum([idx, mid, ring, pink])

        # THUMBS UP / DOWN
        thumb_tip = lm[4]
        thumb_ip = lm[3]
        wrist = lm[0]

        if not idx and not mid and not ring and not pink:
            # UP
            if thumb_tip.y < thumb_ip.y and thumb_tip.y < wrist.y:
                return "THUMBS UP"
            # DOWN
            if thumb_tip.y > thumb_ip.y and thumb_tip.y > wrist.y:
                return "THUMBS DOWN"

        # OPEN PALM → STOP
        if extended >= 4:
            return "STOP"

        # PEACE SIGN
        if idx and mid and not ring and not pink:
            return "PEACE"

        return None


# ============================================================
# APPROACHABILITY DETECTOR CLASS
# ============================================================
class ApproachabilityDetector:
    def __init__(self):
        # MediaPipe init
        self.mp_pose = mp.solutions.pose
        self.mp_face = mp.solutions.face_mesh
        self.mp_hands = mp.solutions.hands

        self.pose = self.mp_pose.Pose()
        self.face_mesh = self.mp_face.FaceMesh(refine_landmarks=True)
        self.hands_detector = self.mp_hands.Hands(
            max_num_hands=1, min_detection_confidence=0.7, min_tracking_confidence=0.7
        )

        # FER Emotion Detector
        self.emotion_detector = FER(mtcnn=True)

        # Internal state tracking
        self.emotion_history = deque(maxlen=15)
        self.score_history = deque(maxlen=15)

        self.gesture_recognizer = GestureRecognizer()

        self.running = False
        self.cap = None

        # Output state (FastAPI reads this)
        self.current_status = {
            "approachable": None,
            "score": None,
            "emotion": None,
            "gesture": None,
            "feedback": []
        }

    # ============================================================
    # MAIN LOOP
    # ============================================================
    def run(self):
        self.running = True
        self.cap = cv2.VideoCapture(0)

        while self.running:
            success, frame = self.cap.read()
            if not success:
                continue

            status = self.process_frame(frame)
            self.current_status = status

        if self.cap:
            self.cap.release()
        cv2.destroyAllWindows()

    def stop(self):
        self.running = False

    # ============================================================
    # PROCESS FRAME (full approachability logic)
    # ============================================================
    def process_frame(self, frame):

        feedback = []
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # ---------------------------------------------------------
        # FACE EMOTION (FER)
        # ---------------------------------------------------------
        try:
            results = self.emotion_detector.detect_emotions(frame)
            if results:
                emotions = results[0]["emotions"]
                dominant_emotion = max(emotions, key=emotions.get)
                conf = emotions[dominant_emotion]
                feedback.append(f"Emotion: {dominant_emotion} ({conf:.2f})")
            else:
                dominant_emotion = "neutral"
                conf = 0
                feedback.append("Emotion: none detected")
        except:
            dominant_emotion = "unknown"
            conf = 0
            feedback.append("Emotion: error")

        # emotion scoring
        EMOTION_WEIGHTS = {
            "happy": 2,
            "neutral": 1,
            "sad": -1,
            "angry": -2,
            "fear": -2,
            "disgust": -2,
            "surprise": 1
        }
        emotion_score = EMOTION_WEIGHTS.get(dominant_emotion, 0)

        # ---------------------------------------------------------
        # BODY POSTURE (MediaPipe Pose)
        # ---------------------------------------------------------
        pose_res = self.pose.process(rgb)
        posture_score = 0

        if pose_res.pose_landmarks:
            lm = pose_res.pose_landmarks.landmark

            left_shoulder = lm[11]
            right_shoulder = lm[12]

            # Shoulder slouch detection
            if abs(left_shoulder.y - right_shoulder.y) < 0.05:
                posture_score += 1
                feedback.append("Posture: balanced")
            else:
                posture_score -= 1
                feedback.append("Posture: uneven shoulders")

        # ---------------------------------------------------------
        # GESTURES (MediaPipe Hands)
        # ---------------------------------------------------------
        hand_res = self.hands_detector.process(rgb)
        gesture = None
        gesture_score = 0

        if hand_res.multi_hand_landmarks:
            hand_lm = hand_res.multi_hand_landmarks[0]
            gesture = self.gesture_recognizer.recognize(hand_lm)
            if gesture:
                feedback.append(f"Gesture: {gesture}")

                if gesture == "THUMBS UP":
                    gesture_score = 2
                elif gesture == "THUMBS DOWN":
                    gesture_score = -3
                elif gesture == "STOP":
                    gesture_score = -2
                elif gesture == "PEACE":
                    gesture_score = 1

        # ---------------------------------------------------------
        # FINAL APPROACHABILITY SCORING
        # ---------------------------------------------------------
        final_score = emotion_score + posture_score + gesture_score

        # Smooth score
        self.score_history.append(final_score)
        smoothed_score = sum(self.score_history) / len(self.score_history)

        approachable = smoothed_score >= 0

        return {
            "approachable": approachable,
            "score": round(float(smoothed_score), 3),
            "emotion": dominant_emotion,
            "gesture": gesture,
            "feedback": feedback,
        }

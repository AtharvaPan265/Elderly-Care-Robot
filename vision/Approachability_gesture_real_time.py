import cv2
import mediapipe as mp
import numpy as np
import math
from fer import FER
from collections import deque, Counter

# =======================================================================
# INITIALIZATION
# =======================================================================

# MediaPipe
mp_pose = mp.solutions.pose
mp_face = mp.solutions.face_mesh
mp_hands = mp.solutions.hands

pose = mp_pose.Pose(min_detection_confidence=0.5,
                    min_tracking_confidence=0.5)

face_mesh = mp_face.FaceMesh(refine_landmarks=True, max_num_faces=1)

hands = mp_hands.Hands(static_image_mode=False,
                       max_num_hands=1,
                       min_detection_confidence=0.7,
                       min_tracking_confidence=0.7)

# FER emotion detector
emotion_detector = FER(mtcnn=True)

# Camera
cap = cv2.VideoCapture(0)

# History buffers
HISTORY_LENGTH = 20
score_history = deque(maxlen=HISTORY_LENGTH)
emotion_history = deque(maxlen=10)
prev_pose = None

# Emotion weights
EMOTION_WEIGHTS = {
    "happy": 2,
    "neutral": 1,
    "surprise": 1,
    "sad": -1,
    "fear": -2,
    "angry": -2,
    "disgust": -2
}

# =======================================================================
# UTILITY FUNCTIONS
# =======================================================================

def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    return angle if angle <= 180 else 360 - angle

def smooth_score():
    return np.mean(score_history) if score_history else 0

def trend_score():
    if len(score_history) < 10:
        return 0
    first = np.mean(list(score_history)[:len(score_history)//2])
    second = np.mean(list(score_history)[len(score_history)//2:])
    return second - first

# =======================================================================
# HAND GESTURE RECOGNITION
# =======================================================================

def is_finger_extended(landmarks, tip_id, pip_id):
    tip = landmarks[tip_id]
    pip = landmarks[pip_id]

    # Thumb uses x direction
    if tip_id == 4:
        return tip.x < landmarks[3].x - 0.05

    return tip.y < pip.y

def recognize_gesture(hand_landmarks):
    if not hand_landmarks:
        return None

    lm = hand_landmarks.landmark

    index_ext = is_finger_extended(lm, 8, 6)
    middle_ext = is_finger_extended(lm, 12, 10)
    ring_ext = is_finger_extended(lm, 16, 14)
    pinky_ext = is_finger_extended(lm, 20, 18)

    num_extended = sum([index_ext, middle_ext, ring_ext, pinky_ext])

    # THUMBS UP
    if not any([index_ext, middle_ext, ring_ext, pinky_ext]):
        thumb_tip = lm[4]
        thumb_ip = lm[3]
        wrist = lm[0]

        if thumb_tip.y < thumb_ip.y - 0.05 and thumb_tip.y < wrist.y - 0.1:
            return "THUMBS UP"

    # THUMBS DOWN
    if not any([index_ext, middle_ext, ring_ext, pinky_ext]):
        thumb_tip = lm[4]
        thumb_ip = lm[3]
        wrist = lm[0]

        if thumb_tip.y > thumb_ip.y + 0.05 and thumb_tip.y > wrist.y + 0.1:
            return "THUMBS DOWN"

    # OPEN PALM (STOP)
    if num_extended >= 4:
        return "STOP"

    # PEACE SIGN
    if index_ext and middle_ext and not ring_ext and not pinky_ext:
        return "PEACE"

    # FIST
    if num_extended == 0:
        return "FIST"

    return None

# =======================================================================
# MAIN LOOP
# =======================================================================

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    h, w, _ = frame.shape

    pose_results = pose.process(rgb)
    face_results = face_mesh.process(rgb)
    hands_results = hands.process(rgb)

    approach_score = 0
    feedback = []

    # ===================================================================
    # EMOTION (FER)
    # ===================================================================
    faces = emotion_detector.detect_emotions(frame)

    if faces:
        emotions = faces[0]["emotions"]
        dominant = max(emotions, key=emotions.get)
        confidence = emotions[dominant]
        emotion_score = EMOTION_WEIGHTS.get(dominant, 0)

        if dominant == "neutral" and confidence < 0.5:
            emotion_score += 0.5

        approach_score += emotion_score
        emotion_history.append(dominant)

        feedback.append(f"Emotion: {dominant} ({confidence:.2f})")
    else:
        feedback.append("Emotion: not detected")

    # ===================================================================
    # BODY POSTURE
    # ===================================================================
    if pose_results.pose_landmarks:
        lm = pose_results.pose_landmarks.landmark

        L_sh = [lm[11].x*w, lm[11].y*h]
        R_sh = [lm[12].x*w, lm[12].y*h]
        R_hip = [lm[24].x*w, lm[24].y*h]

        shoulder_angle = calculate_angle(L_sh, R_sh, R_hip)

        if 70 < shoulder_angle < 110:
            approach_score += 1
            feedback.append("Facing camera")
        else:
            approach_score -= 2
            feedback.append("Body turned away")

        # Arm openness
        L_wrist = [lm[15].x*w, lm[15].y*h]
        R_wrist = [lm[16].x*w, lm[16].y*h]

        dist = np.linalg.norm(np.array(L_wrist) - np.array(R_wrist))
        if dist > w * 0.3:
            approach_score += 1
            feedback.append("Open posture")
        else:
            approach_score -= 1
            feedback.append("Closed posture")

        # Hands near face
        nose = [lm[0].x, lm[0].y]
        L_hand = [lm[15].x, lm[15].y]
        R_hand = [lm[16].x, lm[16].y]

        if math.dist(L_hand, nose) < 0.15 or math.dist(R_hand, nose) < 0.15:
            approach_score -= 1.5
            feedback.append("Hands near face → busy")

        # Motion
        current_pose = np.array([[p.x, p.y] for p in lm])
        if prev_pose is not None:
            motion = np.linalg.norm(current_pose - prev_pose)
            if motion > 0.05:
                approach_score -= 1
                feedback.append("Movement → busy")
        prev_pose = current_pose

    # ===================================================================
    # FACE MICRO-CUES
    # ===================================================================
    if face_results.multi_face_landmarks:
        for fl in face_results.multi_face_landmarks:
            nose = fl.landmark[1]
            L_eye = fl.landmark[33]
            R_eye = fl.landmark[263]

            eye_diff = abs(L_eye.x - R_eye.x)
            centered = abs(0.5 - nose.x) < 0.05

            if centered and eye_diff > 0.03:
                approach_score += 1
                feedback.append("Eye contact")
            else:
                approach_score -= 1
                feedback.append("Looking away")

            mouth_top = fl.landmark[13]
            mouth_bottom = fl.landmark[14]
            open_mouth = abs(mouth_top.y - mouth_bottom.y)

            if open_mouth > 0.04:
                approach_score -= 1
                feedback.append("Talking")

    # ===================================================================
    # GESTURE RECOGNITION
    # ===================================================================
    gesture = None
    if hands_results.multi_hand_landmarks:
        for hl in hands_results.multi_hand_landmarks:
            gesture = recognize_gesture(hl)

    if gesture:
        feedback.append(f"Gesture: {gesture}")

        if gesture == "THUMBS UP":
            approach_score += 3
        elif gesture == "STOP":
            approach_score -= 4
        elif gesture == "THUMBS DOWN":
            approach_score -= 3

    # ===================================================================
    # TEMPORAL SMOOTHING & DECISION
    # ===================================================================
    score_history.append(approach_score)
    smoothed = smooth_score()
    trend = trend_score()

    busy_flag = any("busy" in fb or "talking" in fb for fb in feedback)
    approachable = (smoothed > 0.5 and not busy_flag)

    # ===================================================================
    # VISUALIZATION
    # ===================================================================
    color = (0, 255, 0) if approachable else (0, 0, 255)
    cv2.putText(frame, f"Status: {'Approachable' if approachable else 'Unapproachable'}",
                (30, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)

    cv2.putText(frame, f"Smoothed: {smoothed:.2f} Trend: {trend:.2f}",
                (30, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    y = 130
    for fb in feedback[:7]:
        cv2.putText(frame, f"- {fb}", (30, y), cv2.FONT_HERSHEY_SIMPLEX,
                    0.6, (255, 255, 255), 1)
        y += 25

    if emotion_history:
        mode = Counter(emotion_history).most_common(1)[0][0]
        cv2.putText(frame, f"Emotion Trend: {mode}",
                    (30, y + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6,
                    (200, 200, 255), 1)

    cv2.imshow("Approachability Detector", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

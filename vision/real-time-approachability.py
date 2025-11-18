
import cv2
import mediapipe as mp
import numpy as np
import math
from deepface import DeepFace
from collections import deque, Counter

# Initialize MediaPipe modules
mp_pose = mp.solutions.pose
mp_face = mp.solutions.face_mesh

pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
face_mesh = mp_face.FaceMesh(refine_landmarks=True, max_num_faces=1)

cap = cv2.VideoCapture(0)

# Rolling histories
HISTORY_LENGTH = 20
score_history = deque(maxlen=HISTORY_LENGTH)
emotion_history = deque(maxlen=10)
prev_pose = None

# Emotion weights (positive = approachable, negative = unapproachable)
EMOTION_WEIGHTS = {
    "happy": 2,
    "neutral": 1,
    "surprise": 1,
    "sad": -1,
    "fear": -2,
    "angry": -2,
    "disgust": -2
}

def calculate_angle(a, b, c):
    """Calculate angle between three points."""
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180.0/np.pi)
    return angle if angle <= 180 else 360 - angle

def smooth_score():
    """Average of recent approachability scores."""
    return np.mean(score_history) if score_history else 0

def trend_score():
    """Compute trend of approachability (increasing or decreasing)."""
    if len(score_history) < 10:
        return 0
    first_half = np.mean(list(score_history)[:len(score_history)//2])
    second_half = np.mean(list(score_history)[len(score_history)//2:])
    return second_half - first_half

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    h, w, _ = frame.shape

    pose_results = pose.process(rgb)
    face_results = face_mesh.process(rgb)

    approachability_score = 0
    feedback = []

    # ---------- FACE EMOTION ----------
    try:
        analysis = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
        emotions = analysis[0]['emotion']
        dominant_emotion = max(emotions, key=emotions.get)
        emotion_confidence = emotions[dominant_emotion]
        emotion_score = EMOTION_WEIGHTS.get(dominant_emotion, 0)

        # Elderly-friendly: neutral given benefit if low confidence
        if dominant_emotion == "neutral" and emotion_confidence < 0.5:
            emotion_score += 0.5

        approachability_score += emotion_score
        emotion_history.append(dominant_emotion)
        feedback.append(f"Emotion: {dominant_emotion} ({emotion_confidence:.1f}%)")

    except Exception:
        feedback.append("Emotion: not detected")

    # ---------- BODY POSTURE ----------
    if pose_results.pose_landmarks:
        landmarks = pose_results.pose_landmarks.landmark

        left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x * w,
                         landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y * h]
        right_shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x * w,
                          landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y * h]
        right_hip = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x * w,
                     landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y * h]

        shoulder_angle = calculate_angle(left_shoulder, right_shoulder, right_hip)
        facing_forward = 70 < shoulder_angle < 110
        if facing_forward:
            approachability_score += 1
            feedback.append("Facing camera")
        else:
            approachability_score -= 2
            feedback.append("Body turned away")

        # Arm openness
        try:
            left_wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x * w,
                          landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y * h]
            right_wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x * w,
                           landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y * h]
            arm_distance = np.linalg.norm(np.array(left_wrist) - np.array(right_wrist))
            if arm_distance > w * 0.3:
                approachability_score += 1
                feedback.append("Open posture")
            else:
                approachability_score -= 1
                feedback.append("Closed posture")
        except:
            pass

        # ---------- Activity / Engagement Detection ----------
        nose = landmarks[mp_pose.PoseLandmark.NOSE.value]
        left_hand = landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value]
        right_hand = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value]
        left_dist = math.dist([left_hand.x, left_hand.y], [nose.x, nose.y])
        right_dist = math.dist([right_hand.x, right_hand.y], [nose.x, nose.y])

        if left_dist < 0.15 or right_dist < 0.15:
            approachability_score -= 1.5
            feedback.append("Hands near face → possibly talking/occupied")

        # Motion tracking
        current_pose = np.array([[lm.x, lm.y] for lm in landmarks])
        if prev_pose is not None:
            motion = np.linalg.norm(current_pose - prev_pose)
            if motion > 0.05:
                approachability_score -= 1
                feedback.append("Movement detected → possibly walking/busy")
        prev_pose = current_pose

    # ---------- FACE MICRO-CUES ----------
    if face_results.multi_face_landmarks:
        for face_landmarks in face_results.multi_face_landmarks:
            nose_tip = face_landmarks.landmark[1]
            left_eye = face_landmarks.landmark[33]
            right_eye = face_landmarks.landmark[263]

            eye_diff = abs(left_eye.x - right_eye.x)
            nose_centered = abs(0.5 - nose_tip.x) < 0.05

            if nose_centered and eye_diff > 0.03:
                approachability_score += 1
                feedback.append("Making eye contact")
            else:
                approachability_score -= 1
                feedback.append("Looking away")

            # Mouth openness (talking/busy)
            mouth_top = face_landmarks.landmark[13]
            mouth_bottom = face_landmarks.landmark[14]
            mouth_open = abs(mouth_top.y - mouth_bottom.y)
            if mouth_open > 0.04:
                approachability_score -= 1
                feedback.append("Mouth open → possibly talking")

    # ---------- TEMPORAL & CONTEXTUAL SMOOTHING ----------
    score_history.append(approachability_score)
    smoothed_score = smooth_score()
    trend = trend_score()

    # Multi-factor decision
    busy_flag = any("talking" in fb or "busy" in fb for fb in feedback)
    approachable = (smoothed_score > 0.5 and not busy_flag)

    # ---------- VISUALIZATION ----------
    color = (0, 255, 0) if approachable else (0, 0, 255)
    cv2.putText(frame, f"Status: {'Approachable' if approachable else 'Unapproachable'}",
                (30, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
    cv2.putText(frame, f"Smoothed Score: {smoothed_score:.2f} Trend: {trend:.2f}",
                (30, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    # Feedback
    y = 130
    for fb in feedback[:5]:
        cv2.putText(frame, f"- {fb}", (30, y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
        y += 25

    # Emotion trend
    if emotion_history:
        common_emotion = Counter(emotion_history).most_common(1)[0][0]
        cv2.putText(frame, f"Recent Emotion Trend: {common_emotion}",
                    (30, y + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 255), 1)

    # Confidence visualization
    if score_history:
        confidence = min(1.0, sum(s > 0 for s in score_history) / len(score_history))
        cv2.putText(frame, f"Confidence: {confidence:.2f}",
                    (30, y + 45), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 200, 100), 1)

    cv2.imshow("Approachability Detector", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

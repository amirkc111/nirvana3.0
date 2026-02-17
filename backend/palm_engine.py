import cv2
import mediapipe as mp
import numpy as np
import os

class PalmEngine:
    def __init__(self):
        # Use new Tasks API (Python 3.13 safe)
        BaseOptions = mp.tasks.BaseOptions
        HandLandmarker = mp.tasks.vision.HandLandmarker
        HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
        VisionRunningMode = mp.tasks.vision.RunningMode

        # Path to model (downloaded in models/)
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'hand_landmarker.task')
        
        options = HandLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=model_path),
            running_mode=VisionRunningMode.IMAGE,
            num_hands=1,
            min_hand_detection_confidence=0.3, # Low threshold to catch everything
            min_hand_presence_confidence=0.3
        )
        self.landmarker = HandLandmarker.create_from_options(options)

    def analyze_image(self, image_path):
        try:
            # Load original image
            original_image = mp.Image.create_from_file(image_path)
            
            # Helper to run detection
            def try_detect(mp_img):
                results = self.landmarker.detect(mp_img)
                return results if results.hand_landmarks else None

            # 1. Try Original
            detection_result = try_detect(original_image)
            
            # 2. If Failed, Try Rotating (90, 270, 180)
            # Note: MP Image doesn't support easy rotation, need to use CV2
            if not detection_result:
                cv_img = cv2.imread(image_path)
                rotations = [cv2.ROTATE_90_CLOCKWISE, cv2.ROTATE_90_COUNTERCLOCKWISE, cv2.ROTATE_180]
                
                for rot_code in rotations:
                    rotated_cv = cv2.rotate(cv_img, rot_code)
                    # Convert back to MP Image
                    rotated_rgb = cv2.cvtColor(rotated_cv, cv2.COLOR_BGR2RGB)
                    mp_rotated = mp.Image(image_format=mp.ImageFormat.SRGB, data=rotated_rgb)
                    
                    detection_result = try_detect(mp_rotated)
                    if detection_result:
                        break # Found it!

            # --- LAYER 1: VALIDATION ---
            if not detection_result or not detection_result.hand_landmarks:
                return {"valid": False, "reason": "No hand detected. Please show open palm."}

            # Get first hand
            landmarks = detection_result.hand_landmarks[0]
            
            # --- LAYER 2: METRICS ---
            # Extract basic coordinates (normalized 0-1)
            # 0: Wrist, 4: ThumbTip, 5: IndexMCP, 9: MiddleMCP, 13: RingMCP, 17: PinkyMCP, 20: PinkyTip
            
            def get_pt(idx):
                return landmarks[idx].x, landmarks[idx].y

            wrist = get_pt(0)
            thumb_tip = get_pt(4)
            pinky_tip = get_pt(20)
            
            # Orientation (Left/Right) - Visual Check
            # If thumb.x < pinky.x => Right Hand (usually, if palm facing cam)
            hand_side = "right" if thumb_tip[0] < pinky_tip[0] else "left"
            
            # Shape (Width vs Length)
            # Width: 5 to 17
            # Length: 0 to 9
            w_pt1 = np.array(get_pt(5))
            w_pt2 = np.array(get_pt(17))
            l_pt1 = np.array(get_pt(0))
            l_pt2 = np.array(get_pt(9))
            
            width = np.linalg.norm(w_pt1 - w_pt2)
            length = np.linalg.norm(l_pt1 - l_pt2)
            ratio = length / width if width > 0 else 1.0
            
            hand_shape = "Square/Earth" if 0.9 < ratio < 1.1 else ("Long/Air" if ratio >= 1.1 else "Broad/Fire")

            # --- LAYER 3: MOUNTS ---
            # Placeholder for mount visibility
            mounts = {
                "jupiter": "Standard",
                "saturn": "Standard",
                "sun": "Standard",
                "mercury": "Standard",
                "venus": "Prominent" 
            }

            return {
                "valid": True,
                "data": {
                    "hand_side": hand_side,
                    "hand_shape": hand_shape,
                    "mounts": mounts,
                    "ratio": f"{ratio:.2f}"
                },
                "message": "Hand analyzed successfully."
            }

        except Exception as e:
            return {"valid": False, "reason": str(e)}

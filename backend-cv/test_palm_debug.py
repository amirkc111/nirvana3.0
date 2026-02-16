from palm_engine import PalmEngine
import os

# Path to the actual user image causing issues
test_image_path = "/Users/amyr/.gemini/antigravity/brain/1a8ef8fd-b8f4-4100-bda4-8d5ef250d281/uploaded_image_1766954605285.png"

print(f"--- TESTING PALM ENGINE WITH: {test_image_path} ---")

if not os.path.exists(test_image_path):
    print("ERROR: Test image not found!")
    exit(1)

try:
    engine = PalmEngine()
    print("Engine Initialized.")
    
    result = engine.analyze_image(test_image_path)
    print("--- RESULT ---")
    import pprint
    pprint.pprint(result)
    
except Exception as e:
    print("--- CRASH DETECTED ---")
    import traceback
    traceback.print_exc()

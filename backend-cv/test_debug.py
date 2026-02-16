from vision_engine import ThreeLayerEngine
import os
import cv2

# Path to the uploaded image (from user metadata)
TEST_IMAGE = "/Users/amyr/.gemini/antigravity/brain/1a8ef8fd-b8f4-4100-bda4-8d5ef250d281/uploaded_image_1766952512959.jpg"

def run_test():
    engine = ThreeLayerEngine()
    
    print(f"--- TESTING IMAGE: {TEST_IMAGE} ---")
    if not os.path.exists(TEST_IMAGE):
        print("ERROR: File not found!")
        return

    result = engine.analyze_image(TEST_IMAGE)
    
    print("\n--- RESULT ---")
    import pprint
    pp = pprint.PrettyPrinter(indent=2)
    pp.pprint(result)

if __name__ == "__main__":
    run_test()

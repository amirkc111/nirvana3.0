from flask import Flask, request, jsonify
from flask_cors import CORS
from vision_engine import ThreeLayerEngine
import os
import base64
import numpy as np
import cv2
from palm_engine import PalmEngine
import uuid

app = Flask(__name__)
CORS(app) # Enable CORS for frontend

# Initialize Engines
kundli_engine = ThreeLayerEngine()
palm_engine = PalmEngine()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "Nirvana CV Engine"})

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "No image data provided"}), 400
            
        # Decode Base64
        img_str = data['image']
        if ',' in img_str:
            img_str = img_str.split(',')[1] # Remove data:image/png;base64 header
            
        nparr = np.frombuffer(base64.b64decode(img_str), np.uint8)
        
        # Save temp file for OpenCV (easiest way to reuse existing engine logic)
        temp_path = "temp_upload.png"
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        cv2.imwrite(temp_path, img)
        
        # Run Analysis
        result = kundli_engine.analyze_image(temp_path)
        
        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        return jsonify({"horoscope_data": result})
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"valid": False, "errors": [str(e)], "trace": traceback.format_exc()}), 500

@app.route('/analyze-palm', methods=['POST'])
def analyze_palm():
    temp_path = None
    try:
        data = request.json
        if 'image' not in data:
            return jsonify({"error": "No image provided"}), 400
        
        # Decode Base64
        image_data = data['image'].split(',')[1] if ',' in data['image'] else data['image']
        img_bytes = base64.b64decode(image_data)
        
        # Save temp file
        filename = f"temp_palm_{uuid.uuid4()}.png"
        temp_path = os.path.join(os.getcwd(), filename)
        with open(temp_path, "wb") as f:
            f.write(img_bytes)
            
        # Analyze
        result = palm_engine.analyze_image(temp_path)
        
        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        return jsonify({"horoscope_data": result})
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({"valid": False, "reason": str(e), "trace": traceback.format_exc()}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)

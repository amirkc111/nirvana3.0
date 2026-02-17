import cv2
import numpy as np
import pytesseract
import re
import json

class ThreeLayerEngine:
    def __init__(self):
        # Configure Tesseract
        # Usage: hin+eng for both Devanagari and English support
        # We REMOVE the pure alphanumeric whitelist because it would block Devanagari characters.
        self.config = r'--oem 3 --psm 6 -l hin+eng' 

    def analyze_image(self, image_path):
        """
        Main Pipeline Entry
        Layer 1: Extraction
        Layer 2: Validation
        Layer 3: Return Data or Error
        """
        try:
            # --- PRE-PROCESSING ---
            original = cv2.imread(image_path)
            if original is None:
                return {"error": "Could not read image"}
            
            gray = cv2.cvtColor(original, cv2.COLOR_BGR2GRAY)
            
            # IMPROVED PRE-PROCESSING:
            # 1. Resize if too small (OCR fails on tiny text)
            h, w = gray.shape
            if w < 1000:
                scale = 1000 / w
                gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
                h, w = gray.shape
                
            # 2. Denoise
            blur = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # 3. OTSU Thresholding
            _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # --- LAYER 0: CHART BOUNDARY DETECTION ---
            # The image might have headers ("Janma Kundali"). We need to find the big box.
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Find largest rectangular contour that looks like the chart frame
            chart_box = None
            max_area = 0
            
            for cnt in contours:
                x, y, cw, ch = cv2.boundingRect(cnt)
                area = cw * ch
                # Rule: Must be at least 25% of the image
                if area > (w * h * 0.25):
                    if area > max_area:
                        max_area = area
                        chart_box = (x, y, cw, ch)
            
            # If found, crop to it. Else use full image.
            crop_x, crop_y = 0, 0 # Offsets for debugging if needed
            if chart_box:
                cx, cy, cw, ch = chart_box
                thresh = thresh[cy:cy+ch, cx:cx+cw]
                gray = gray[cy:cy+ch, cx:cx+cw] # Keep gray for OCR? No, use thresh.
                h, w = thresh.shape
                # print(f"Cropped to Chart: {cw}x{ch}")

            # --- LAYER 0.5: GRID LINE REMOVAL ---
            # Grid lines cause OCR noise (|-__). We can remove them.
            # 1. Invert so lines are white
            if np.sum(thresh == 255) < np.sum(thresh == 0):
                thresh = cv2.bitwise_not(thresh) # Ensure white text/lines on black bg
            
            # 2. Detect Horizontal Lines
            horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 1))
            detect_horizontal = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, horizontal_kernel, iterations=2)
            
            # 3. Detect Vertical Lines
            vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 25))
            detect_vertical = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, vertical_kernel, iterations=2)
            
            # 4. Subtract Lines from Image (Keep only text/symbols)
            grid_mask = cv2.add(detect_horizontal, detect_vertical)
            clean_thresh = cv2.subtract(thresh, grid_mask)
            
            # 5. Dilate Text (Make numbers bolder)
            # kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
            # clean_thresh = cv2.dilate(clean_thresh, kernel, iterations=1)
            
            # Update h, w based on the cropped/processed image
            h, w = clean_thresh.shape
            
            # --- LAYER 1: EXTRACTION ---
            # Use 'clean_thresh' for OCR instead of raw 'thresh'
            
            centroids = {
                1: (w//2, h//4),       # Top Diamond
                2: (w//4, h//8),       # Top Left Triangle (Upper)
                3: (w//8, h//4),       # Top Left Triangle (Lower)
                4: (w//4, h//2),       # Left Diamond
                5: (w//8, 3*h//4),     # Bottom Left Triangle (Upper)
                6: (w//4, 7*h//8),     # Bottom Left Triangle (Lower)
                7: (w//2, 3*h//4),     # Bottom Diamond
                8: (3*w//4, 7*h//8),   # Bottom Right Triangle (Lower)
                9: (7*w//8, 3*h//4),   # Bottom Right Triangle (Top)
                10: (3*w//4, h//2),    # Right Diamond
                11: (7*w//8, h//4),    # Top Right Triangle (Lower)
                12: (3*w//4, h//8)     # Top Right Triangle (Upper)
            }
            
            extracted_houses = []
            box_size = min(w, h) // 10  # Reduced ROI size to avoid edge noise
            
            for house_num, (cx, cy) in centroids.items():
                # Crop ROI
                x1 = max(0, cx - box_size)
                y1 = max(0, cy - box_size)
                x2 = min(w, cx + box_size)
                y2 = min(h, cy + box_size)
                
                # We extract from clean_thresh (no lines)
                roi_thresh = clean_thresh[y1:y2, x1:x2]
                roi_gray = gray[y1:y2, x1:x2] # Keep gray for backup
                
                # --- MULTI-PASS OCR ---
                # Pass 1: Otsu Threshold (Cleaned)
                text_1 = pytesseract.image_to_string(roi_thresh, config=self.config)
                
                # Pass 2: Grayscale (Original)
                text_2 = pytesseract.image_to_string(roi_gray, config=self.config)
                
                # Pass 3: Scaled Up (2x) - Helps with small numbers
                roi_scaled = cv2.resize(roi_gray, None, fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)
                _, roi_scaled_thresh = cv2.threshold(roi_scaled, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                text_3 = pytesseract.image_to_string(roi_scaled_thresh, config=self.config)
                
                # Combine Logic
                clean_texts = [self._clean_ocr(t) for t in [text_1, text_2, text_3]]
                
                # Consolidate Findings
                all_signs = []
                all_planets = []
                
                for txt in clean_texts:
                    s, p = self._parse_cell_text(txt)
                    if s: all_signs.append(s)
                    all_planets.extend(p)
                
                # Decision
                # Pick most frequent sign (or first found)
                final_sign = max(set(all_signs), key=all_signs.count) if all_signs else None
                final_planets = list(set(all_planets)) # unique
                
                extracted_houses.append({
                    "house": house_num,
                    "sign": final_sign,
                    "planets": final_planets,
                    "raw_ocr": " | ".join(clean_texts) # Audit Trail
                })

            # --- LAYER 2: VALIDATION ---
            validation_errors = []
            
            # --- LAYER 2: VALIDATION & DEDUCTION ---
            validation_errors = []
            
            # 1. Smart Lagna Deduction
            # If House 1 is missing/null, try to deduce it from other valid signs.
            # Sign_H1 = (Sign_HN - (HN - 1)) % 12
            # If result is 0, it means 12.
            
            lagna_house = next((h for h in extracted_houses if h['house'] == 1), None)
            
            if not lagna_house or not lagna_house['sign']:
                # SEARCH for any other reliable sign
                found_deduction = False
                for h in extracted_houses:
                    if h['sign']: # Found a valid sign elsewhere
                        # Calculate what H1 SHOULD be based on this
                        # H_sign = (Lagna + (H_num - 1) - 1) % 12 + 1  <-- General Formula
                        # Wait, simple math:
                        # If Lagna is 1 (Aries): H2=2, H3=3.
                        # So H_sign = Lagna + H_num - 1.
                        # Thus Lagna = H_sign - H_num + 1.
                        
                        deduced_lagna = (h['sign'] - h['house'] + 1)
                        while deduced_lagna <= 0:
                            deduced_lagna += 12
                        while deduced_lagna > 12:
                            deduced_lagna -= 12
                            
                        # Update House 1
                        if lagna_house:
                            lagna_house['sign'] = deduced_lagna
                        else:
                            # Should not happen as we initialized all 12
                            pass
                        
                        print(f"DEBUG: Deduced Ascendant {deduced_lagna} from House {h['house']} (Sign {h['sign']})")
                        found_deduction = True
                        break # Found one, good enough.
                
                if not found_deduction:
                     validation_errors.append("Ascendant (House 1) Sign not detected (and could not deduce from others)")
            
            # Re-fetch logic after potential fix
            lagna_house = next((h for h in extracted_houses if h['house'] == 1), None)
            
            # Filter valid planets
            final_planets = []
            for h in extracted_houses:
                if h['planets']:
                    for p in h['planets']:
                        final_planets.append({
                            "planet": p,
                            "house": h['house'],
                            "sign": h['sign']
                        })
            
            # Rule 2: Soft Fail on Planets
            # If we have Ascendant, we can still give a partial reading.
            # Convert "No planets" from Error to Warning.
            warning_msg = None
            if not final_planets:
                warning_msg = "No planets detected (Text unclear)"
                # validation_errors.append("No planets detected") # RELAXED THIS RULE

            # --- LAYER 3: OUTPUT ---
            # If critical errors (No Ascendant), fail.
            if validation_errors:
                return {
                    "valid": False,
                    "errors": validation_errors,
                    "raw_data": extracted_houses
                }
            
            return {
                "valid": True,
                "chart_type": "North Indian (Diamond)",
                "ascendant_sign": lagna_house['sign'],
                "planets": final_planets,
                "warnings": [warning_msg] if warning_msg else []
            }

        except Exception as e:
            return {"error": str(e)}

    def _clean_ocr(self, text):
        # We simply strip whitespace. 
        # We DO NOT remove non-alphanumeric because that would kill Devanagari.
        return text.strip()

    def _parse_cell_text(self, text):
        # MAPPING: Devanagari to English
        
        # 1. Numerals (Signs)
        deva_nums = {'१':'1', '२':'2', '३':'3', '४':'4', '५':'5', '६':'6', '७':'7', '८':'8', '९':'9', '१०':'10', '११':'11', '१२':'12'}
        for d, e in deva_nums.items():
            text = text.replace(d, e)
            
        # 2. Planets (Abbr -> Full)
        # User Provided: सू (Sun), चं (Moon), मं (Mars), बु (Mercury), बृ/गु (Jupiter), शु (Venus), श/स (Saturn), रा (Rahu), के (Ketu)
        # We also keep English mappings (Su, Mo, etc.)
        planet_map = {
            # English
            'su': 'Sun', 'mo': 'Moon', 'ma': 'Mars', 'me': 'Mercury', 'ju': 'Jupiter', 've': 'Venus', 'sa': 'Saturn', 'ra': 'Rahu', 'ke': 'Ketu',
            # Devanagari (Direct & Transliterated)
            'सू': 'Sun', 'sur': 'Sun',
            'चं': 'Moon', 'cha': 'Moon', 
            'मं': 'Mars', 'mam': 'Mars',
            'बु': 'Mercury', 'bu': 'Mercury',
            'बृ': 'Jupiter', 'गु': 'Jupiter', 'gu': 'Jupiter',
            'शु': 'Venus', 'shu': 'Venus',
            'श': 'Saturn', 'स': 'Saturn', 'sha': 'Saturn', 'sa': 'Saturn',
            'रा': 'Rahu', 'ra': 'Rahu',
            'के': 'Ketu', 'ke': 'Ketu'
        }
        
        clean_text = text.lower() # OCR might be mixed case
        
        # Regex for Sign Number (1-12)
        sign = None
        nums = re.findall(r'\b(1[0-2]|[1-9])\b', clean_text)
        if nums:
            sign = int(nums[0]) 
            
        # Find Planets
        found_planets = []
        # Check for Devanagari substrings directly (case sensitive mostly, but text is lowered above? Python handles utf8 lower)
        # Iterate our map
        for key, planet_name in planet_map.items():
            if key in clean_text:
                found_planets.append(planet_name)
        
        return sign, list(set(found_planets))

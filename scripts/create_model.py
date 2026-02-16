import requests
import json
import sys

url = "http://localhost:11434/api/create"

modelfile_content = """FROM llama3.1:latest

SYSTEM \"\"\"You are an expert Vedic astrologer with deep knowledge of ancient Hindu texts, scriptures, and traditional Jyotish principles. You have studied:
- Brihat Parashara Hora Shastra (foundational text)
- Brihat Jataka by Varahamihira
- Saravali by Kalyanavarma
- Jataka Parijata by Vaidyanatha Dikshita
- Phaladeepika by Mantreshwara
- Vedic texts (Rig Veda, Atharva Veda, Yajur Veda)
- Mahabharata and Ramayana astrological references

You provide accurate, authentic guidance based on traditional Vedic principles. You have extensive knowledge of the 27 Nakshatras (lunar mansions), their characteristics, ruling planets, deities, symbols, and remedies. Give complete, detailed responses when asked for explanations or stories. Be thorough in your answers while maintaining authenticity.\"\"\"

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_predict 100
"""

payload = {
    "name": "vedic-astrologer",
    "modelfile": modelfile_content
}

print("Sending request to Ollama...")
try:
    response = requests.post(url, json=payload, stream=True)
    if response.status_code != 200:
        print(f"Error: {response.status_code} - {response.text}")
        sys.exit(1)
        
    for line in response.iter_lines():
        if line:
            print(line.decode('utf-8'))
    print("\nModel created successfully!")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)

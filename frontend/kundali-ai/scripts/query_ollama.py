# query_ollama.py
# Sends Kundali JSON to Ollama API (local) for interpretation.
import requests, json, os

OLLAMA_URL = os.environ.get('OLLAMA_URL', 'http://localhost:11434')
MODEL = os.environ.get('OLLAMA_MODEL', 'kundali-ai')

def query(kundali_json_path):
    with open('prompts/interpretation_prompt.txt') as f:
        prompt_header = f.read()
    with open(kundali_json_path) as f:
        kundali = json.load(f)
    payload = {
        "model": MODEL,
        "prompt": prompt_header + "\n\n" + json.dumps(kundali, indent=2, ensure_ascii=False),
        "max_tokens": 800
    }
    resp = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, stream=True)
    try:
        for line in resp.iter_lines():
            if line:
                print(line.decode('utf-8'))
    except Exception as e:
        print('Error streaming response:', e)

if __name__ == '__main__':
    query('kundali.json')


import sys
import os
import hashlib
import argparse

# Check if TTS is installed before crashing
try:
    from TTS.api import TTS
except ImportError:
    print("Error: Coqui TTS not installed. Run: pip install TTS")
    sys.exit(1)

def get_filename(text):
    # Create a stable hash of the text for caching
    hash_obj = hashlib.md5(text.encode('utf-8'))
    return f"chk_{hash_obj.hexdigest()}.mp3"

def main():
    parser = argparse.ArgumentParser(description='Generate TTS from text using Coqui TTS')
    parser.add_argument('text', type=str, help='Text to speak')
    parser.add_argument('--out_dir', type=str, default='../public/audio/cache', help='Output directory')
    parser.add_argument('--model_name', type=str, default='tts_models/multilingual/multi-dataset/xtts_v2', help='Model name')
    parser.add_argument('--speaker_wav', type=str, default=None, help='Path to target speaker wav for cloning')
    parser.add_argument('--language', type=str, default='en', help='Language code (en, fr, pt, etc.)')
    
    args = parser.parse_args()
    
    # Ensure cache dir exists
    os.makedirs(args.out_dir, exist_ok=True)
    
    filename = get_filename(args.text)
    full_path = os.path.join(args.out_dir, filename)
    
    # Check cache
    if os.path.exists(full_path):
        print(f"CACHE: {full_path}")
        return

    print(f"GENERATING: {full_path}")
    
    # Initialize TTS (only if we need to generate)
    try:
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        
        print(f"Loading model: {args.model_name} on {device}")
        tts = TTS(model_name=args.model_name).to(device)
        
        # Run TTS
        # XTTS requires speaker_wav or specific handling
        if "xtts" in args.model_name:
             if not args.speaker_wav:
                 # XTTS needs a speaker. If none provided, list speakers or fail?
                 # Actually XTTS v2 comes with default speakers too, but usually for cloning you pass a wav.
                 # We can let it fail or default if arguments missing.
                 print("WARNING: XTTS usually requires --speaker_wav for cloning.")
        
        tts.tts_to_file(
            text=args.text, 
            file_path=full_path, 
            speaker_wav=args.speaker_wav, 
            language=args.language
        )
        print(f"SUCCESS: {full_path}")
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()

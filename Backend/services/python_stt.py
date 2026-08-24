import speech_recognition as sr
import sys
import io
from concurrent.futures import ThreadPoolExecutor, as_completed

# Force UTF-8 stdout/stderr on Windows to handle Hindi/Devanagari characters
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def recognize_lang(r, audio, lang):
    try:
        text = r.recognize_google(audio, language=lang)
        if text:
            return text.strip()
    except Exception:
        return None
    return None

def main():
    if len(sys.argv) < 2:
        print("ERROR: No audio file provided")
        return

    try:
        r = sr.Recognizer()
        with sr.AudioFile(sys.argv[1]) as source:
            audio = r.record(source)

        # Run Hindi (hi-IN) and Indian English (en-IN) concurrently in parallel threads for max speed
        with ThreadPoolExecutor(max_workers=2) as executor:
            futures = [
                executor.submit(recognize_lang, r, audio, 'hi-IN'),
                executor.submit(recognize_lang, r, audio, 'en-IN')
            ]
            
            for future in as_completed(futures):
                result = future.result()
                if result:
                    print(result)
                    return

        print("(No speech detected)")
    except Exception as e:
        print("ERROR:", str(e))

if __name__ == '__main__':
    main()

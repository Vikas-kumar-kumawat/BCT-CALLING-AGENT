import speech_recognition as sr
import sys
import io
from concurrent.futures import ThreadPoolExecutor, wait

# Force UTF-8 stdout/stderr on Windows to handle Hindi/Devanagari characters
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def recognize_lang(r, audio, lang):
    try:
        response = r.recognize_google(audio, language=lang, show_all=True)
        if not response or not isinstance(response, dict) or 'alternative' not in response:
            return None
            
        alternatives = response.get('alternative', [])
        if not alternatives:
            return None
            
        best_alt = alternatives[0]
        transcript = best_alt.get('transcript', '').strip()
        confidence = best_alt.get('confidence', 0.0)
        
        if transcript:
            return {'transcript': transcript, 'confidence': confidence, 'lang': lang}
    except Exception:
        pass
    return None

def main():
    if len(sys.argv) < 2:
        print("ERROR: No audio file provided")
        return

    try:
        r = sr.Recognizer()
        with sr.AudioFile(sys.argv[1]) as source:
            audio = r.record(source)

        with ThreadPoolExecutor(max_workers=2) as executor:
            future_hi = executor.submit(recognize_lang, r, audio, 'hi-IN')
            future_en = executor.submit(recognize_lang, r, audio, 'en-IN')
            
            wait([future_hi, future_en])
            
            res_hi = future_hi.result()
            res_en = future_en.result()
            
            results = [res for res in (res_hi, res_en) if res is not None]
            
            if not results:
                print("(No speech detected)")
                return
                
            best_result = None
            for res in results:
                if best_result is None:
                    best_result = res
                else:
                    if res['confidence'] > best_result['confidence']:
                        best_result = res
            
            print(best_result['transcript'])
            
    except Exception as e:
        print("ERROR:", str(e))

if __name__ == '__main__':
    main()

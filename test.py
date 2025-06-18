'''import subprocess
import json

HEYGEN_API_KEY = "NjVhNmQ2M2E1MmNiNGEzYzhkYjc4NzkyNzMyMjFkYzgtMTc0ODAxOTIwMQ=="  # ← Replace this!

HEYGEN_API_URL_LIST_AVATARS = "https://api.heygen.com/v2/avatars"
HEYGEN_API_URL_LIST_VOICES = "https://api.heygen.com/v2/voices"

def run_curl_direct(url):
    command = [
        "curl", "-s",
        "-H", "Accept: application/json",
        "-H", f"x-api-key: {HEYGEN_API_KEY}",
        url
    ]
    try:
        print("\nRunning command:", ' '.join(command))  # ← Debug
        result = subprocess.run(command, capture_output=True, text=True, timeout=30)
        print("STDOUT:\n", result.stdout)  # ← Debug
        print("STDERR:\n", result.stderr)  # ← Debug

        if result.returncode != 0:
            return None, f"Curl failed: {result.stderr}"
        if not result.stdout.strip():
            return None, "Empty output from curl"
        
        return json.loads(result.stdout), None
    except Exception as e:
        return None, str(e)

def get_heygen_info():
    print("Fetching Avatars...")
    avatar_json, avatar_error = run_curl_direct(HEYGEN_API_URL_LIST_AVATARS)
    if avatar_error:
        print("Error fetching avatars:", avatar_error)
    else:
        print("Avatars fetched successfully.")
        print(json.dumps(avatar_json, indent=2))

    print("\nFetching Voices...")
    voice_json, voice_error = run_curl_direct(HEYGEN_API_URL_LIST_VOICES)
    if voice_error:
        print("Error fetching voices:", voice_error)
    else:
        print("Voices fetched successfully.")
        print(json.dumps(voice_json, indent=2))

if __name__ == "__main__":
    get_heygen_info()'''

import os
import time
import json
import requests
from dotenv import load_dotenv

# --- 1. LOAD CONFIG ---
load_dotenv()  # make sure you have a .env file with HEYGEN_API_KEY
HEYGEN_API_KEY = os.getenv("HEYGEN_API_KEY")
if not HEYGEN_API_KEY:
    raise RuntimeError("Please set HEYGEN_API_KEY in your environment or .env file")

HEADERS = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "x-api-key": HEYGEN_API_KEY
}

AVATARS_URL = "https://api.heygen.com/v2/avatars"
VOICES_URL  = "https://api.heygen.com/v2/voices"
CREATE_URL  = "https://api.heygen.com/v2/videos"

# --- 2. HELPERS ---
def fetch_list(url, key):
    """Fetches a list (avatars or voices) and returns the 'data' -> key array."""
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    payload = resp.json().get("data", {})
    items = payload.get(key, [])
    if not items:
        raise RuntimeError(f"No items found under '{key}' in response")
    return items

def create_video(avatar_id, voice_id, script_text):
    """Starts video creation, returns the video_id."""
    body = {
        "video_inputs": [{
            "character": {
                "type": "avatar",
                "avatar_id": avatar_id,
                "avatar_style": "normal"
            },
            "voice": {
                "type": "text",
                "voice_id": voice_id,
                "input_text": script_text
            }
        }],
        "test": True,  # change to False for production
        "dimension": {"width": 1920, "height": 1080},
        "title": "Automated Test Video"
    }
    resp = requests.post(CREATE_URL, json=body, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    vid = resp.json().get("data", {}).get("video_id")
    if not vid:
        raise RuntimeError("Failed to retrieve video_id from create response")
    return vid

def poll_video(video_id, interval=15):
    """Polls for video completion; returns final video_url."""
    status_url = f"{CREATE_URL}/{video_id}"
    while True:
        resp = requests.get(status_url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        data = resp.json().get("data", {})
        status = data.get("status")
        print(f"  → Status: {status}")
        if status == "completed":
            return data.get("video_url")
        if status == "failed":
            raise RuntimeError("Video generation failed: " + str(data.get("error")))
        time.sleep(interval)

# --- 3. MAIN FLOW ---
if __name__ == "__main__":
    print("1) Fetching avatars...")
    avatars = fetch_list(AVATARS_URL, "avatars")
    first_avatar = avatars[0]
    print("DEBUG - first_avatar content:", first_avatar)
    print(f"   → Using Avatar: {first_avatar.get('name','Unknown')} (ID={first_avatar.get('avatar_id','Unknown')}")

    print("\n2) Fetching voices...")
    voices = fetch_list(VOICES_URL, "voices")
    first_voice = voices[0]
    print(f"   → Using Voice: {first_voice['name']} (ID={first_voice['voice_id']})")

    print("\n3) Creating video...")
    script = "Hello from HeyGen API! This is a test run."
    video_id = create_video(first_avatar["avatar_id"], first_voice["voice_id"], script)
    print(f"   → Video ID: {video_id}")

    print("\n4) Polling for completion (may take a minute)...")
    video_url = poll_video(video_id)
    print("\n🎉 Video ready! Download URL:")
    print(video_url)

import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

def test_system():
    print("--- STARTING TACTICAL SYSTEM AUDIT ---")
    
    # 1. Test HQ Broadcast
    print("1. Testing HQ Broadcast to ALL Units...")
    try:
        r1 = requests.post(f"{BASE_URL}/messages/send", 
                          json={"convoy_id": "ALL", "content": "VERIFIED_HQ_SIGNAL"},
                          timeout=5)
        print(f"   Status: {r1.status_code}")
        print(f"   Response: {r1.text}")
    except Exception as e:
        print(f"   FAILED: {e}")

if __name__ == "__main__":
    test_system()

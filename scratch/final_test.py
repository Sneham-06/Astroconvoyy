import requests

BASE = "http://127.0.0.1:5000/api"

# Step 1: Send HQ message to convoy 4
print("Sending HQ message to convoy 4...")
r = requests.post(f"{BASE}/messages/send", json={"convoy_id": "4", "content": "FINAL_TEST_ALPHA_SIGNAL"})
print(f"  Send status: {r.status_code} | {r.json()}")

# Step 2: Fetch messages as if driver with ID 4
print("\nFetching messages as driver (convoy_id=4)...")
r2 = requests.get(f"{BASE}/messages/get/4")
print(f"  Fetch status: {r2.status_code}")
data = r2.json()
print(f"  Messages found: {len(data.get('messages', []))}")
for m in data.get('messages', []):
    print(f"    -> {m['content']} @ {m['timestamp']}")

# Step 3: Also test global broadcast (ALL)
print("\nSending GLOBAL broadcast to ALL...")
r3 = requests.post(f"{BASE}/messages/send", json={"convoy_id": "ALL", "content": "ALL_UNITS_GLOBAL_TEST"})
print(f"  Send status: {r3.status_code} | {r3.json()}")

print("\nFetching messages as driver (convoy_id=4) - should include ALL...")
r4 = requests.get(f"{BASE}/messages/get/4")
data4 = r4.json()
print(f"  Total messages (specific + global): {len(data4.get('messages', []))}")
for m in data4.get('messages', []):
    print(f"    -> {m['content']} @ {m['timestamp']}")

print("\n--- RESULT: SYSTEM IS", "WORKING!" if len(data4.get('messages', [])) >= 2 else "BROKEN!" , "---")

import time
import requests
import random

def run_build():
    print("------------------------------------------")
    print("🛠️ Automated Build System [v2.0]")
    print("------------------------------------------")
    
    print("[1/4] Resolving dependencies...")
    time.sleep(2)
    
    print("[2/4] Compiling source code...")
    time.sleep(3)
    
    # Simulate a potential failure
    success = random.random() > 0.1
    
    if success:
        print("[3/4] Running unit tests...")
        time.sleep(2)
        print("[4/4] Generating production bundle...")
        time.sleep(1)
        
        status_msg = "✅ Build SUCCESS: v2.0.1 deployed to staging."
        title = "Build System"
        msg_type = "SYSTEM"
    else:
        print("❌ ERROR: Compilation failed at line 42 (syntax error).")
        status_msg = "🚨 Build FAILED: Check logs for details."
        title = "Build Alert"
        msg_type = "DANGER"

    print(f"\n{status_msg}")
    
    # 🔔 Notify the PWA
    try:
        requests.post(
            'http://localhost:3000/api/notify', 
            json={
                'message': status_msg,
                'title': title,
                'type': msg_type
            }
        )
        print("🔔 Notification pushed to SynqNotify Activity Hub.")
    except Exception as e:
        print(f"❌ Could not reach backend: {e}")

if __name__ == "__main__":
    run_build()

import subprocess
import time
import urllib.request
import json
import os
import sys

def run_test():
    env = os.environ.copy()
    env["PYTHONPATH"] = os.path.abspath("backend")

    print("Starting FastAPI backend...")
    proc = subprocess.Popen([sys.executable, "-m", "uvicorn", "main:app", "--port", "8000"], cwd="backend", env=env)

    try:
        # Wait for server to start
        time.sleep(5)
        
        # Test Health endpoint
        print("Testing /health endpoint...")
        req = urllib.request.Request("http://127.0.0.1:8000/health")
        with urllib.request.urlopen(req) as response:
            print("Health response:", response.read().decode())

        # Test Analyze endpoint with a simple Java snippet
        print("Testing /analyze endpoint (This will verify your Google API Key)...")
        data = json.dumps({
            "code": "public class Hello { public static void main(String[] args) { System.out.println(\"Hello\"); } }", 
            "language": "java"
        }).encode("utf-8")
        
        req = urllib.request.Request("http://127.0.0.1:8000/api/v1/analyze", data=data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            print("Analyze Request Successful!")
            print("Time Complexity:", result.get("time_complexity"))
            print("Space Complexity:", result.get("space_complexity"))
            print("Tests generated:", len(result.get("junit_tests", [])))
            
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print(e.read().decode())
    except Exception as e:
        print(f"Error during test: {str(e)}")
    finally:
        print("Shutting down backend...")
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    run_test()

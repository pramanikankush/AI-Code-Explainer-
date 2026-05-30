import google.generativeai as genai
import json
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Configure Gemini
genai.configure(api_key=GOOGLE_API_KEY)

def explain_and_generate_tests(file_path):
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        return

    with open(file_path, "r") as f:
        code_content = f.read()

    model = genai.GenerativeModel(
        "gemini-2.5-flash",
        system_instruction="You are a Senior Java developer. Return JSON only."
    )

    prompt = f"""
    Analyze the following Java code. Provide an explanation, complexity analysis (Time/Space), and a list of JUnit tests.
    
    Code:
    {code_content}
    
    Return valid JSON only with this structure:
    {{
        "explanation": "High-level summary",
        "complexity": "Time: O(?), Space: O(?)",
        "junit_tests": ["Full Java Test Code 1", "Full Java Test Code 2"]
    }}
    """

    print(f"Analyzing {file_path}...")
    
    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        result = json.loads(response.text)
        
        # Print Explanation
        print("\n--- Code Explanation ---")
        print(result['explanation'])
        print("\n--- Complexity ---")
        print(result['complexity'])
        
        # Write Tests to File
        test_file_path = "GeneratedTest.java"
        with open(test_file_path, "w") as f:
            f.write("// Generated JUnit Tests\n")
            for test in result['junit_tests']:
                f.write(test + "\n\n")
        
        print(f"\n✅ JUnit tests written to {test_file_path}")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python explain.py <path_to_java_file>")
    else:
        explain_and_generate_tests(sys.argv[1])

# Code Explanation - Code Explainer

## explain.py

### 1. System Instruction
```python
model = genai.GenerativeModel(
    "gemini-2.5-flash",
    system_instruction="You are a Senior Java developer. Return JSON only."
)
```
- By setting a `system_instruction`, we give Gemini a persona. This influences the tone and technical depth of the explanation and the quality of the generated code.

### 2. File I/O
- The script takes a file path as a command-line argument (`sys.argv[1]`).
- It reads the code and injects it into the prompt.

### 3. Structured Analysis
- The prompt asks for three specific things: Summary, Complexity, and Tests.
- `response_mime_type: "application/json"` ensures that we get a structured response that is easy to split programmatically.

### 4. Code Generation
```python
with open("GeneratedTest.java", "w") as f:
    for test in result['junit_tests']:
        f.write(test + "\n\n")
```
- The script automatically creates or overwrites `GeneratedTest.java` with the JUnit code provided by Gemini. This turns the AI's output into a usable source file immediately.

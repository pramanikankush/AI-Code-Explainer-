import json
import logging
import google.generativeai as genai
from fastapi import HTTPException
from core.config import settings
from models.schemas import CodeAnalysisRequest, CodeAnalysisResponse

logger = logging.getLogger(__name__)

class GenAIService:
    def __init__(self):
        if not settings.GOOGLE_API_KEY:
            logger.warning("GOOGLE_API_KEY is not set. Service will fail.")
        else:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            
        self.model = genai.GenerativeModel(
            model_name=settings.MODEL_NAME,
            system_instruction=(
                "You are an elite Staff Software Engineer and Architecture Expert. "
                "You provide production-ready analysis, focusing on deep architectural insights, "
                "exact complexity analysis, and robust enterprise-grade test generation. "
                "Always return valid JSON according to the schema requested."
            )
        )

    async def analyze_code(self, request: CodeAnalysisRequest) -> CodeAnalysisResponse:
        
        mode_instruction = ""
        if request.mode == "beginner":
            mode_instruction = "Explain concepts simply, avoiding overly dense jargon. Focus on what the code does line-by-line and why it works."
        elif request.mode == "architect":
            mode_instruction = "Focus heavily on design patterns, system scalability, tight coupling, SOLID principles, and high-level structural decisions."
        else:
            mode_instruction = "Provide a deep, expert-level technical analysis balancing logic explanation with algorithmic efficiency."

        prompt = f"""
        Analyze the following {request.language} code. 
        MODE: {request.mode.upper()} -> {mode_instruction}
        
        Provide a premium, deep technical explanation, architectural critique,
        accurate Big-O complexity analysis (Time/Space) with reasoning, potential security vulnerabilities, 
        actionable refactoring steps, and a list of robust, production-ready unit tests.
        
        Code:
        ```
        {request.code}
        ```
        
        Return EXCLUSIVELY a JSON object matching this exact schema:
        {{
            "explanation": "Markdown formatted explanation. Tailor tone to the requested mode.",
            "architecture": "Markdown formatted architectural breakdown and design pattern detection.",
            "time_complexity": "Time: O(?) - <reasoning>",
            "space_complexity": "Space: O(?) - <reasoning>",
            "junit_tests": ["<full test class code 1>"],
            "security_vulnerabilities": ["issue 1", "issue 2"],
            "refactor_suggestions": ["refactor idea 1", "refactor idea 2"]
        }}
        """

        try:
            response = await self.model.generate_content_async(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            result_dict = json.loads(response.text)
            
            return CodeAnalysisResponse(
                explanation=result_dict.get("explanation", "Analysis failed to generate explanation."),
                architecture=result_dict.get("architecture", "No architectural insights generated."),
                time_complexity=result_dict.get("time_complexity", "Unknown"),
                space_complexity=result_dict.get("space_complexity", "Unknown"),
                junit_tests=result_dict.get("junit_tests", []),
                security_vulnerabilities=result_dict.get("security_vulnerabilities", []),
                refactor_suggestions=result_dict.get("refactor_suggestions", [])
            )
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM JSON: {e}")
            logger.error(f"Raw response: {response.text}")
            raise HTTPException(status_code=500, detail="Failed to generate structured response from AI.")
        except Exception as e:
            logger.error(f"GenAI API Error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")

genai_service = GenAIService()

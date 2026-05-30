from fastapi import APIRouter, HTTPException, Depends
from models.schemas import CodeAnalysisRequest, CodeAnalysisResponse
from services.genai import genai_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/analyze", response_model=CodeAnalysisResponse)
async def analyze_code_endpoint(request: CodeAnalysisRequest):
    """
    Analyze code using GenAI to provide explanation, complexity, and tests.
    """
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Code content cannot be empty")
        
    logger.info(f"Analyzing {request.language} code snippet ({len(request.code)} bytes) in {request.mode} mode.")
    
    try:
        response = await genai_service.analyze_code(request)
        return response
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error in analyze endpoint: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred")

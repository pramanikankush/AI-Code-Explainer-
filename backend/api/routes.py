from fastapi import APIRouter, HTTPException, Depends, Response
from models.schemas import CodeAnalysisRequest, CodeAnalysisResponse, CodeChatRequest, CodeChatResponse
from services.genai import genai_service
from services.rate_limiter import rate_limit_dependency
from services.cache import analysis_cache
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/analyze", response_model=CodeAnalysisResponse, dependencies=[Depends(rate_limit_dependency)])
async def analyze_code_endpoint(request: CodeAnalysisRequest, response: Response):
    """
    Analyze code using GenAI to provide explanation, complexity, and tests.
    """
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Code content cannot be empty")
        
    # Check cache
    cached_res = analysis_cache.get(request.code, request.language, request.mode)
    if cached_res:
        logger.info("Cache hit for code analysis request.")
        response.headers["X-Cache"] = "HIT"
        return cached_res

    logger.info(f"Cache miss. Analyzing {request.language} code snippet ({len(request.code)} bytes) in {request.mode} mode.")
    
    try:
        analysis_result = await genai_service.analyze_code(request)
        # Store in cache
        analysis_cache.set(request.code, request.language, request.mode, analysis_result)
        response.headers["X-Cache"] = "MISS"
        return analysis_result
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error in analyze endpoint: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred")

@router.post("/chat", response_model=CodeChatResponse, dependencies=[Depends(rate_limit_dependency)])
async def chat_code_endpoint(request: CodeChatRequest):
    """
    Chat contextually about the provided code snippet.
    """
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Code content cannot be empty")
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
        
    logger.info(f"Chat request for {request.language} code.")
    
    try:
        chat_response = await genai_service.chat_code(request)
        return chat_response
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred")

from pydantic import BaseModel, Field
from typing import List, Optional

class CodeAnalysisRequest(BaseModel):
    code: str = Field(..., description="The source code to analyze")
    language: str = Field(default="java", description="The programming language of the code")
    mode: str = Field(default="expert", description="Analysis mode: beginner, expert, or architect")
    
class CodeAnalysisResponse(BaseModel):
    explanation: str = Field(..., description="High-level summary and detailed explanation of the code")
    architecture: str = Field(..., description="Architectural insights, design patterns, and structural feedback")
    time_complexity: str = Field(..., description="Time complexity analysis (e.g., O(N)) with brief reasoning")
    space_complexity: str = Field(..., description="Space complexity analysis (e.g., O(1)) with brief reasoning")
    junit_tests: List[str] = Field(..., description="List of complete, runnable test code blocks")
    security_vulnerabilities: Optional[List[str]] = Field(default=[], description="Any identified security risks or code smells")
    refactor_suggestions: Optional[List[str]] = Field(default=[], description="Actionable refactoring and optimization steps")
    
class HealthCheckResponse(BaseModel):
    status: str
    version: str

class CodeChatRequest(BaseModel):
    code: str = Field(..., description="The source code context")
    language: str = Field(default="java", description="The programming language of the code")
    question: str = Field(..., description="The user's question about the code")

class CodeChatResponse(BaseModel):
    answer: str = Field(..., description="Markdown formatted answer to the user's question")

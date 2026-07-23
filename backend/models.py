from pydantic import BaseModel, Field, EmailStr
from typing import Dict, List, Optional, Any
from datetime import datetime

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    username: str
    email: str
    full_name: str
    token: str

class ScanResponse(BaseModel):
    id: str
    username: str
    platform: str
    url: str
    risk_score: int
    category: str
    text_score: int
    image_score: int
    behavior_score: int
    network_score: int
    bot_score: int
    details: Dict[str, Any]
    timestamp: datetime

class AlertResponse(BaseModel):
    id: str
    username: str
    platform: str
    risk_score: int
    type: str
    timestamp: datetime
    status: str

class FlagRequest(BaseModel):
    username: str
    platform: str
    risk_score: int
    flagged: bool

class TrendPoint(BaseModel):
    date: str
    scans: int
    threats: int

class StatsResponse(BaseModel):
    total_scans: int
    threat_detected: int
    suspicious_scans: int
    safe_profiles: int
    avg_risk: float
    accuracy_rate: float
    detection_trend: List[TrendPoint]

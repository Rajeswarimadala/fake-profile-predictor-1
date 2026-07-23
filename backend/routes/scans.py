from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Header
from typing import Optional, List, Any
from datetime import datetime
from bson import ObjectId
from database import scans_col, alerts_col
from services.analyzer import analyze_profile

router = APIRouter(prefix="/scan", tags=["Scanning"])

def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        return "guest_user"
    token = authorization.split(" ")[1]
    if token.startswith("jwt_mock_token_for_"):
        return token[len("jwt_mock_token_for_"):]
    return "guest_user"

def serialize_scan(doc) -> dict:
    if not doc:
        return {}
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    # Convert datetime objects to ISO strings
    if isinstance(doc.get("timestamp"), datetime):
        doc["timestamp"] = doc["timestamp"].isoformat()
        
    # Ensure category names are updated
    category = doc.get("category", "Genuine Account")
    if category == "Fake Profile":
        doc["category"] = "High-Risk Fake Profile"
    elif category == "Suspicious":
        doc["category"] = "Suspicious Account"
    elif category == "Real Profile":
        doc["category"] = "Genuine Account"

    # Make sure bot_score is present
    if "bot_score" not in doc:
        doc["bot_score"] = int(doc.get("behavior_score", 50) * 0.9 + 5)
        
    # Make sure details has the structured format
    details = doc.get("details", {})
    if isinstance(details, dict) and any(isinstance(v, str) for v in details.values()):
        doc["details"] = {
            "text": {
                "score": doc.get("text_score", 50),
                "bio_analysis": details.get("text", "Text analysis complete."),
                "username_analysis": "Analysing text keywords and handle metrics.",
                "keyword_detection": "Detected typical vocabulary patterns.",
                "ai_probability": f"{int(doc.get('text_score', 50) * 0.9)}%"
            },
            "image": {
                "score": doc.get("image_score", 50),
                "deepfake_probability": f"{doc.get('image_score', 50)}%",
                "authenticity_score": f"{100 - doc.get('image_score', 50)}%",
                "manipulation_detected": "Yes" if doc.get("image_score", 50) >= 50 else "No"
            },
            "behavior": {
                "score": doc.get("behavior_score", 50),
                "posting_frequency": details.get("behavior", "Behavior evaluation complete."),
                "engagement_pattern": "Auditing engagement distributions and timelines.",
                "follower_ratio": "Suspicious follower ratio." if doc.get("behavior_score", 50) >= 50 else "Normal follower ratio.",
                "activity_consistency": "Consistent automated behaviors." if doc.get("behavior_score", 50) >= 50 else "Circadian cycles normal."
            },
            "network": {
                "score": doc.get("network_score", 50),
                "trust_score": f"{100 - doc.get('network_score', 50)}%",
                "mutual_analysis": details.get("network", "Graph neural check complete."),
                "suspicious_connections": "High cluster density." if doc.get("network_score", 50) >= 50 else "Isolated connection nodes."
            },
            "bot": {
                "score": doc["bot_score"],
                "automation_likelihood": f"{doc['bot_score']}%",
                "bot_score_detail": f"{doc['bot_score']}/100",
                "spam_indicators": "Spam vectors detected in profile nodes." if doc["bot_score"] >= 50 else "No significant spam signatures."
            }
        }
    return doc

@router.post("")
async def create_scan(
    username: str = Form(...),
    platform: str = Form(...),
    url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    authorization: Optional[str] = Header(None)
):
    if not username:
        raise HTTPException(status_code=400, detail="Username is required")
    
    owner = get_current_user(authorization)
    
    # Generate profile URL if not provided
    if not url:
        domain = platform.lower().replace(" ", "")
        url = f"https://{domain}.com/{username.strip('@')}"
        
    has_image = file is not None
    
    # Run simulated analysis
    scan_result = analyze_profile(username, platform, url, has_image)
    scan_result["owner"] = owner
    
    # Save to scans collection
    insert_result = scans_col.insert_one(scan_result)
    scan_result["_id"] = insert_result.inserted_id
    
    # Proactively add an alert if risk score is high
    alert_type = "Scan Completed"
    alerts_col.insert_one({
        "owner": owner,
        "username": scan_result["username"],
        "platform": scan_result["platform"],
        "risk_score": scan_result["risk_score"],
        "type": alert_type,
        "timestamp": datetime.utcnow(),
        "status": "active"
    })
    
    if scan_result["risk_score"] >= 75:
        alerts_col.insert_one({
            "owner": owner,
            "username": scan_result["username"],
            "platform": scan_result["platform"],
            "risk_score": scan_result["risk_score"],
            "type": "High-Risk Profile Detected",
            "timestamp": datetime.utcnow(),
            "status": "active"
        })
        
    return serialize_scan(scan_result)

@router.get("/history")
def get_history(limit: int = 20, authorization: Optional[str] = Header(None)):
    try:
        owner = get_current_user(authorization)
        cursor = scans_col.find({"owner": owner}).sort("timestamp", -1).limit(limit)
        return [serialize_scan(doc) for doc in cursor]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{scan_id}")
def get_scan(scan_id: str, authorization: Optional[str] = Header(None)):
    if not ObjectId.is_valid(scan_id):
        raise HTTPException(status_code=400, detail="Invalid scan ID format")
        
    owner = get_current_user(authorization)
    doc = scans_col.find_one({"_id": ObjectId(scan_id), "owner": owner})
    if not doc:
        raise HTTPException(status_code=404, detail="Scan report not found")
        
    return serialize_scan(doc)

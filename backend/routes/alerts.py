from fastapi import APIRouter, HTTPException, Query, Header
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from database import alerts_col
from models import FlagRequest

router = APIRouter(prefix="/alerts", tags=["Alerts"])

def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        return "guest_user"
    token = authorization.split(" ")[1]
    if token.startswith("jwt_mock_token_for_"):
        return token[len("jwt_mock_token_for_"):]
    return "guest_user"

def serialize_alert(doc) -> dict:
    if not doc:
        return {}
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    if isinstance(doc.get("timestamp"), datetime):
        doc["timestamp"] = doc["timestamp"].isoformat()
    return doc

@router.get("")
def get_alerts(risk_level: Optional[str] = Query(None), authorization: Optional[str] = Header(None)):
    owner = get_current_user(authorization)
    query = {"owner": owner}
    if risk_level == "high":
        query["risk_score"] = {"$gte": 75}
    elif risk_level == "medium":
        query["risk_score"] = {"$gte": 40, "$lt": 75}
        
    try:
        cursor = alerts_col.find(query).sort("timestamp", -1)
        return [serialize_alert(doc) for doc in cursor]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/flag")
def flag_profile(request: FlagRequest, authorization: Optional[str] = Header(None)):
    owner = get_current_user(authorization)
    if request.flagged:
        exists = alerts_col.find_one({"owner": owner, "username": request.username, "platform": request.platform})
        if not exists:
            alert_type = "Flagged by Admin"
            alert_doc = {
                "owner": owner,
                "username": request.username,
                "platform": request.platform,
                "risk_score": request.risk_score,
                "type": alert_type,
                "timestamp": datetime.utcnow(),
                "status": "flagged"
            }
            alerts_col.insert_one(alert_doc)
        return {"status": "success", "message": f"Profile {request.username} successfully flagged."}
    else:
        alerts_col.delete_many({"owner": owner, "username": request.username, "platform": request.platform})
        return {"status": "success", "message": f"Profile {request.username} successfully unflagged."}

@router.post("/notify")
def create_custom_notification(
    notification_type: str = Query(...),
    username: str = Query(...),
    platform: str = Query(...),
    risk_score: int = Query(0),
    authorization: Optional[str] = Header(None)
):
    owner = get_current_user(authorization)
    alert_doc = {
        "owner": owner,
        "username": username,
        "platform": platform,
        "risk_score": risk_score,
        "type": notification_type,
        "timestamp": datetime.utcnow(),
        "status": "active"
    }
    alerts_col.insert_one(alert_doc)
    return {"status": "success", "message": "Custom notification created."}

@router.delete("/{alert_id}")
def dismiss_alert(alert_id: str, authorization: Optional[str] = Header(None)):
    if not ObjectId.is_valid(alert_id):
        raise HTTPException(status_code=400, detail="Invalid alert ID format")
        
    owner = get_current_user(authorization)
    result = alerts_col.delete_one({"_id": ObjectId(alert_id), "owner": owner})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    return {"status": "success", "message": "Alert dismissed."}
